/**
 * İstikbal Aerospace — local-only CMS restore smoke test.
 * Tests 21 pages, 537 fields and 21 versions in temporary 127.0.0.1 PostgreSQL.
 * Never connects to Supabase; not a full Auth/Storage/RLS restore.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { homedir } from 'node:os';
import { join } from 'node:path';

const EXPECTED_SHA256 = '96d4e8980e97d050a206879e55af2a78dac733b6ae71b91dadf1012015ac13c0';
const BACKUP_FOLDER = 'hosted-2026-11-13T01-35-49-680Z';
const BASE = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
const backup = join(BASE, 'IstikbalAerospace', 'cms-backups', BACKUP_FOLDER, 'supabase-full-logical.dump');
const pgBin = process.env.CMS_POSTGRES_BIN || join(homedir(), 'Downloads', 'pgsql', 'bin');
const tools = Object.fromEntries(['initdb', 'pg_ctl', 'psql', 'pg_restore'].map(n => [n, join(pgBin, n + '.exe')]));
let tempDir = null, dbDir = null, password = null, port = null, stage = 'hazırlık';

function run(bin, args, { timeout = 45000, env = process.env, allowFailure = false, stdio = 'pipe' } = {}) {
  const r = spawnSync(bin, args, { env, stdio, encoding:'utf8', timeout, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  if (!allowFailure && (r.error || r.status !== 0 || r.signal)) {
    const reason = r.error?.code === 'ETIMEDOUT' ? 'zaman aşımı' : (r.error?.message || 'çıkış kodu ' + r.status);
    const issues = (r.stderr || '').split('\n').filter(s => /(?:ERROR|FATAL|could not|failed|hata)/i.test(s)).slice(-2).map(s => s.slice(0,180));
    throw new Error(stage + ': ' + reason + (issues.length ? ' — ' + issues.join('; ') : ''));
  }
  return r;
}
function step(label) { stage = label; console.log('>>> ' + label + ' ...'); }
function hashFile(file) {
  return new Promise((ok, fail) => {
    const hash=createHash('sha256'), src=createReadStream(file);
    src.on('data', b=>hash.update(b));
    src.on('error', fail);
    src.on('end', ()=>ok(hash.digest('hex')));
  });
}
function localhostPort() {
  return new Promise((ok,fail)=>{
    const s=createServer();
    s.once('error',fail);
    s.listen(0,'127.0.0.1',()=>{
      const p=s.address().port;
      s.close(e=>e?fail(e):ok(p));
    });
  });
}
function pgEnv() {
  return { ...process.env, PGPASSWORD:password, PGHOST:'127.0.0.1', PGPORT:String(port), PGUSER:'postgres', PGDATABASE:'postgres', PGCONNECT_TIMEOUT:'5' };
}
function pgArgs() { return ['-h','127.0.0.1','-p',String(port),'-U','postgres','-d','postgres']; }
function cleanup() {
  if (dbDir && existsSync(join(dbDir,'PG_VERSION'))) {
    const status=run(tools.pg_ctl,['-D',dbDir,'status'],{timeout:5000,allowFailure:true,stdio:'ignore'});
    if (status.status === 0) {
      const stop=run(tools.pg_ctl,['-D',dbDir,'-m','fast','-w','stop'],{timeout:20000,allowFailure:true,stdio:'ignore'});
      if (stop.status !== 0 || stop.error) {
        console.error('UYARI: Yerel test veritabanı kapatılamadı. Geçici klasörü silme:', tempDir);
        return;
      }
    }
  }
  if (tempDir) {
    try {rmSync(tempDir,{recursive:true,force:true,maxRetries:4,retryDelay:250});}
    catch {console.error('UYARI: Geçici dizin silinemedi:',tempDir);}
  }
}
async function main() {
  step('yedek ve PostgreSQL araçları kontrolü');
  for(const [name,path] of Object.entries(tools)) if(!existsSync(path)) throw Error('Eksik araç: '+name+' — '+path);
  if(!existsSync(backup)) throw Error('Orijinal yedek bulunamadı: '+backup);
  if(await hashFile(backup) !== EXPECTED_SHA256) throw Error('Yedek SHA-256 eşleşmiyor; durduruldu.');
  console.log('   SHA-256 doğrulandı; orijinal yedeğe yazılmayacak.');
  const list=run(tools.pg_restore,['--list',backup],{timeout:20000});
  for(const t of ['cms_documents','cms_page_fields','cms_versions']) {
    if(!new RegExp('\\bTABLE DATA\\s+public\\s+'+t+'\\b').test(list.stdout)) throw Error('Arşivde eksik tablo verisi: '+t);
  }
  const root=join(BASE,'IstikbalAerospace');
  mkdirSync(root,{recursive:true});
  tempDir=mkdtempSync(join(root,'cms-restore-check-'));
  dbDir=join(tempDir,'data');
  password=randomBytes(36).toString('base64url');
  const passFile=join(tempDir,'password.tmp');
  writeFileSync(passFile,password+'\n',{mode:0o600});
  try {
    step('geçici PostgreSQL oluşturma (en fazla 60 saniye)');
    run(tools.initdb,['-D',dbDir,'-U','postgres','--auth=scram-sha-256','--encoding=UTF8','--pwfile',passFile,'--no-instructions'],{timeout:60000});
  } finally { rmSync(passFile,{force:true}); }
  port=await localhostPort();
  step('127.0.0.1 üzerinde PostgreSQL başlatma (en fazla 30 saniye)');
  run(tools.pg_ctl,['-D',dbDir,'-l',join(tempDir,'postgres.log'),'-o','-h 127.0.0.1 -p '+port,'-w','start'],{timeout:30000,stdio:'ignore'});
  const schemaFile=join(tempDir,'schema.sql');
  writeFileSync(schemaFile,`CREATE TABLE public.cms_documents (
    id uuid PRIMARY KEY, kind text NOT NULL, slug text NOT NULL, body jsonb,
    approval text, status text, revision integer, updated_at timestamptz,
    UNIQUE(kind,slug));
  CREATE TABLE public.cms_page_fields (
    page_slug text NOT NULL, key text NOT NULL, kind text, label text,
    fallback text, PRIMARY KEY(page_slug,key));
  CREATE TABLE public.cms_versions (
    document_id uuid NOT NULL, revision integer NOT NULL,
    body jsonb, actor uuid, created_at timestamptz,
    PRIMARY KEY(document_id,revision));`,{mode:0o600});
  step('yerel test tablolarını oluşturma (en fazla 20 saniye)');
  run(tools.psql,[...pgArgs(),'-X','-v','ON_ERROR_STOP=1','-f',schemaFile],{timeout:20000,env:pgEnv()});
  step('CMS verilerini geri yükleme (en fazla 90 saniye)');
  run(tools.pg_restore,[
    '--data-only','--schema=public','--table=cms_documents','--table=cms_page_fields','--table=cms_versions',
    '--no-owner','--no-acl','--exit-on-error','--strict-names',
    ...pgArgs(),backup
  ],{timeout:90000,env:pgEnv()});
  step('kayıtları sayma (en fazla 15 saniye)');
  const query="select (select count(*) from public.cms_documents where kind='page') || '|' || (select count(*) from public.cms_page_fields) || '|' || (select count(*) from public.cms_versions);";
  const r=run(tools.psql,[...pgArgs(),'-X','-A','-t','-v','ON_ERROR_STOP=1','-c',query],{timeout:15000,env:pgEnv()});
  const counts=r.stdout.trim();
  if(counts !== '21|537|21') throw Error('Kayıt sayısı uyuşmuyor: '+counts+'; beklenen 21|537|21');
  console.log('BASARILI: YEREL CMS VERI KURTARMA TESTI - 21 sayfa / 537 alan / 21 surum.');
  console.log('NOT: Bu test Auth, Storage dosyaları, RLS ve Supabase platformunun tam geri yüklemesi değildir.');
}
try { await main(); }
catch(e) { console.error('TEST BASARISIZ:',e.message); process.exitCode=1; }
finally { cleanup(); }
