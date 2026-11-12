# Ücretsiz yedekleme ve geri yükleme — 12 Kasım 2026

## Kabul durumu ve kapsam

Free planda otomatik günlük yedek garanti değildir. DB yedeği Storage dosyalarını içermez. Bu tur gerçek şirket verisi silinmedi, sıfırlanmadı veya geri yüklenmedi. Hosted tam DB dump/restore **yapılmadı**: özel DB/operatör erişimi yok. Aşağıdaki prosedürün hosted kabulü açık kalır.

`tests/cms-restore.test.ts` mevcut beş migration'ı ve 21/537 seed'i izole PGlite PostgreSQL'e yükler. Sentetik yayıncıyla taslak, yayın, sonraki taslak ve ilişki oluşturur; bütün veri dizinini dışa aktarır; kaynaktaki sonraki değişiklikten bağımsız ikinci instance'a geri yükler. Belgeler, sürümler, yayınlar, ilişkiler, audit, alanlar ve roller birebir karşılaştırılır. Restore sonrasında anon taslak erişimi, AAL1 engeli, AAL2 sürüm geri alma ve rol iptali yeniden denenir. **Başarılıdır.** Bu fiziksel PGlite fixture deneyi, Supabase hosted pg_dump/pg_restore veya gerçek Auth/MFA kurtarma testi değildir.

## Yedek paketi

- DB: roller, şema, veri, CMS özel şeması ve allowlist; migration geçmişi; Auth kullanıcı/faktör verileri. Bunlar kişisel ve güvenlik açısından hassastır.
- Storage: `cms-media` içindeki **private dahil bütün dosyalar** ve yol/SHA-256/byte manifest'i; CMS metadata (alt metin, hak onayı, görünürlük, revision). Kayıtsız kalmış yüklemeler de dosya envanterine dahildir.
- Güvenli operatör kasası: Auth signup/anonymous/OTP/TOTP, SMTP, site/redirect allowlist ve worker ayarları; API/JWT/SMTP sırları Git'ten ayrı. DB dump bunların tamamının yedeği değildir.
- Git: tam commit SHA, migration dosyaları ve hash'leri, deploy yapılandırması. Hosted migration timestamp'i ile dosya adı farklı olabilir; eşleştirme isim/içerikle yapılır.

## DB dışa aktarımı — yetkili operatör

1. Mevcut proje `uftnykormtwlzolwbhfb` olduğundan emin olun. Yeni hosted proje açmayın. Ücretsiz kota ve yerel disk kapasitesini kontrol edin. CMS yazılarını ve medya yüklemelerini bakım penceresinde durdurun; public snapshot okunmaya devam edebilir. DB ve Storage ortak transaction değildir.
2. Docker ve pinned Supabase CLI 3.1.0 bulunan, CI dışındaki güvenli operatör bilgisayarını kullanın. `SUPABASE_ACCESS_TOKEN` ve gerekiyorsa `SUPABASE_DB_PASSWORD` yalnız özel ortamdan alınır. Terminal kaydı/debug/xtrace kapalı olsun. Şifreyi komut argümanına koymayın, mevcut DB şifresini bu iş için sıfırlamayın.
3. CLI'ı yalnız mevcut projeye linkleyin. Aşağıdaki komutlarda çıktı dizini repo dışında, sahibi dışında erişime kapalı ve önceden boş olmalıdır. CLI bağlantı/status çıktısını açık loga basmayın. Hata olursa eksik paketi başarılı saymayın.

```sh
umask 077
npx --yes supabase@3.1.0 link --project-ref uftnykormtwlzolwbhfb
# Linklenen checkout içinde kalın; hedefi özel, repo dışındaki mevcut dizin yapın.
CMS_BACKUP_DIR="/encrypted/istikbal-backups/new-empty-package"
test -d "$CMS_BACKUP_DIR"
npx --yes supabase@3.1.0 db dump --linked --role-only --file "$CMS_BACKUP_DIR/roles.sql"
npx --yes supabase@3.1.0 db dump --linked --file "$CMS_BACKUP_DIR/schema.sql"
npx --yes supabase@3.1.0 db dump --linked --data-only --use-copy --file "$CMS_BACKUP_DIR/data.sql"
npx --yes supabase@3.1.0 db dump --linked --schema supabase_migrations --file "$CMS_BACKUP_DIR/history-schema.sql"
npx --yes supabase@3.1.0 db dump --linked --schema supabase_migrations --data-only --use-copy --file "$CMS_BACKUP_DIR/history-data.sql"
npx --yes supabase@3.1.0 db diff --linked --schema auth,storage > "$CMS_BACKUP_DIR/auth-storage-changes.sql"
(cd "$CMS_BACKUP_DIR" && sha256sum roles.sql schema.sql data.sql history-schema.sql history-data.sql auth-storage-changes.sql > SHA256SUMS)
```

4. Supabase CLI, yönetilen şemalarda filtreleme yapar. Paket içeriğinde `cms_private` allowlist/fonksiyonları, bütün `cms_*` tabloları, auth kullanıcı/faktör verileri ve migration geçmişinin bulunduğunu **özel ortamda** doğrulayın. Auth trigger'ları ve Storage RLS/bucket değişiklikleri için `auth-storage-changes.sql` ayrıca incelenir. Mevcut güvenlik migration'ları karşılaştırma kaynağıdır; restore üstüne körlemesine tekrar çalıştırılmaz. Auth/Storage sürüm uyuşmazlığı veya diff hatası varsa kurtarma kabulü verilmez.
5. UTC zaman, commit, kaynak PG/Auth/Storage sürümü ve tablo sayımlarını özel manifest'e yazın. Yedeği şifreli yerel disk ve mevcut ücretsiz, erişimi kısıtlı ikinci konumda tutun. Auth/faktör içeren SQL, e-posta ve medya kopyalarını GitHub artifact'ına veya rapora yüklemeyin. SHA-256 kazara bozulmayı yakalar; manifest ile birlikte değiştirilmiş pakete karşı kimlik doğrulama sağlamaz.

## Özel medya aracı

`node scripts/cms/media-backup.mjs /guvenli/repo-disinda/yeni-dizin`

- Yalnız sabit mevcut proje ve `cms-media` bucket'ını **okur**. Özel operatör ortamında `SUPABASE_SERVICE_ROLE_KEY` gerekir; uygulama/Workers runtime'ına konmaz. Parent dizin önceden var olmalıdır. Mevcut hedefi veya repo içini kullanmayı reddeder.
- Dosya ve metadata sayfalanır. Envanter önce/sonra karşılaştırılır; değişmiş/kayıp/geçersiz dosyada durur. 30 saniyelik istek sınırı ve varsayılan 64 MiB indirme tavanı vardır. Kota başlığına göre operatör `CMS_MEDIA_BACKUP_MAX_BYTES` değerini belirleyebilir; ücretli kapasite açılmaz.
- Dizin 0700, dosyalar 0600. Her dosya boyutu ve SHA-256 doğrulanır; `manifest.json` en son yazılır. Başarısız paketi kullanmayın. Dosya yolu/metadata/anahtar loglanmaz. Özel metadata manifest içinde yer aldığından paketi gizli tutun.
- Çevrimdışı bütünlük: `node scripts/cms/media-backup.mjs --verify /guvenli/yedek-dizini`. Anahtar gerekmez. Yol taşması, yinelenen yol, eksik/bozuk dosya reddedilir.
- Operasyon sırasında yeni yükleme/yazı durmalıdır. Bu araç DB snapshot'ı almaz, şifreleme yapmaz ve uzak veriye geri yükleme yapmaz. İş bitince anahtarı ortamdan kaldırın.

Yerel otomatik test, bozuk/eksik/yol taşması içeren arşivi ve dosya izinlerini denetler. CLI/Mailpit CI testi ayrıca gerçek **yerel Supabase Storage** dosyasını bu araçla yedekleyip farklı izole yola geri yükler; byte hash'ini ve anonim indirme engelini karşılaştırır. Gerçek hosted medya yedeği alınmış sayılmaz.

## İzole tam geri yükleme kabulü — henüz açık

1. Ücretsiz yerel Docker Supabase kullanın; hosted mevcut projeyi hedeflemeyin. Sürümleri kaynakla eşleştirin. Yedeğin hash'lerini ve hedefin yalnız localhost olduğunu doğrulayın. SQL'de `ON_ERROR_STOP=1`, uygun transaction ve kısıt kontrolleri kullanın; hata satırlarını yok sayarak devam etmeyin.
2. Resmî CLI restore sırasını izleyin: gözden geçirilmiş roller → şema → veri → gerektiğinde ayrı migration geçmişi ve özel Auth/Storage değişiklikleri. Standart Auth/Storage nesnelerini iki kez oluşturmayın. Güvenlik kontrolünü devre dışı bırakmak bu projenin kabul yöntemi değildir; trigger/constraint nedeniyle hata varsa uyumlu yerel restore planını düzeltin.
3. Manifest'teki bütün dosyaları **private** bucket'a aynı yolla, `upsert:false` ile koyun; SHA-256 karşılaştırın. Restore sırasında public download açmayın. Metadata/izinleri ancak DB ve bütün dosyalar tutarlıysa etkinleştirin. Kayıp dosya referansı varsa yayınları kapalı bırakın.
4. 21 sayfa/537 alan, kayıt/sürüm/ilişki/audit/allowlist/rol sayımları, FK ve index/RLS/security-definer search_path/grant'ları karşılaştırın. Anon taslak/özel medya reddi, AAL1 reddi, OTP/TOTP AAL2, yayın ve medya izin geri çekme, eski JWT ile iptal denensin. Geri yüklenen eski oturumlar yeniden yetki kazanmamalı: yetkili Auth Admin ile oturum iptali ve yeniden OTP/MFA kabulü zorunludur.
5. RPO/RTO bu gerçek prova tamamlandığında kaydedilir; mevcut fixture süresi üretim RTO değildir. Sonuç onaylanmadan hosted restore yapmayın. Hosted veriyi değiştiren kurtarma ayrıca açık onay gerektirir.

## Yayın veya migration geri dönüşü

Hatalı içerikte sürümü **yeni taslak** olarak geri alın, önizleyin, onaylayın ve yayımlayın; public cache etiketinin yenilendiğini doğrulayın. Sorunlu görselde izin geri çekme ve bağlı yayınları taslağa alma akışını kullanın. DB snapshot restore, günlük içerik geri alma yöntemi değildir.

Kod hatasında CMS anahtarlarını kapatın; güvenli önceki commit'e normal revert PR hazırlayın. Migration hatasında otomatik down/drop/reset, history repair veya force push yoktur. Önce yeni yedek ve incelenmiş forward fix; veri kaybı gerektiren restore ancak açık izinle. Mevcut hosted migration'lar bu görevde yeniden uygulanmadı.

## Kaynaklar

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://supabase.com/docs/guides/self-hosting/restore-from-platform
- https://pglite.dev/docs/api#dumpdatadir
