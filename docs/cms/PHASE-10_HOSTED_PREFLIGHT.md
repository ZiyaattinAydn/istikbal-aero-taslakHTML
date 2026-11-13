# İSTİKBAL AEROSPACE — Aşama 10 / Hosted Preflight ve Kontrollü Geçiş

**Tarih:** 13 Kasım 2026
**Kaynak:** `feat/cms-staging-release` / PR #24
**Hedef:** Supabase `uftnykormtwlzolwbhfb`, yalnız `istikbal-cms-staging` Cloudflare Worker
**Karar:** **HENÜZ NO-GO** — salt okunur denetim tamam, veritabanı yedeği/restore ve gerçek staging kabulü doğrulanmadı.

## 1. Gerçek servise karşı gerçekleştirilen salt okunur denetim

`scripts/cms/hosted-readiness.sql` dosyası, Supabase proje ID'si doğrulandıktan sonra doğrudan hosted Postgres'te `SELECT` olarak başarıyla çalıştırıldı. Komut hiçbir içerik satırı, e-posta, parola, erişim anahtarı veya OTP değeri döndürmez.

| Kontrol | 13 Kasım sonucu | Beklenen / yorum |
| --- | --- | --- |
| `cms_documents` | 21 | Tamamı `page`; 13 kanonik içerik henüz yok |
| Tekil sayfa slug'ı | 21 | 21 sayfa korunuyor |
| `cms_page_fields` | 537 | Değer/key kaybı gözlenmedi; içerik testi ayrıca CI'da |
| `cms_versions` | 21 | Sürüm geçmişi mevcut |
| `cms_published` | 0 | Henüz yayınlanmış CMS snapshot yok |
| `cms_media` | 0 | CMS'ye yüklenen görsel yok |
| `storage.objects` (`cms-media`) | 0 | Bu bucket için dosya yedeği henüz sıfır; yeniden denetle |
| `auth.users` | 1 | Yetkili kullanıcının Auth/sesyon durumu korunmalı |
| Aktif `publisher` | 1 | Rol mevcut |
| 8 CMS tablosunda RLS | 8/8 true | Tek başına bütün politika testleri yerine geçmez |
| `cms_public_media_validation` trigger | etkin | Medya yayın güvenliği korunuyor |
| `cms_private.mutate` | eski | `unpublish` yok; `approved` kontrolü mevcut |
| Supabase security advisor | 1 WARN | `auth_leaked_password_protection`; CMS passwordless OTP, yine de Auth ayarlarını ayrıca teyit et |
| Supabase performance advisor | 5 INFO | Kullanılmayan indeks uyarıları; boş/az kullanılan tablolarda indeks silme |
| Supabase health advisor | 0 | Kritik ek sağlık uyarısı görülmedi |

**Ek kaynak/hosted nesne mutabakatı:** İlk beş GitHub migration dosyasındaki beklenen 14 CMS fonksiyon adı ve imzasının 14'ü de hosted `pg_proc` içinde mevcut. `auth.users` üzerindeki iki yönetici koruma trigger'ı ile CMS belgeleri/yayınları üzerindeki beş trigger etkin (7/7). **Bu sadece nesne varlığı denetimidir**; fonksiyonların SQL gövdelerinin, policy/GRANT'lerin, constraint'lerin kaynakla birebir aynı olduğunu kanıtlamaz. Mevcut 5 migration'ı doğrudan eşdeğer saymayacağız.

Mevcut `cms_private.mutate` tanımı MD5 envanter izi: `3c906585828587e9dbac4ef27fdaebe7`. **Bu iz bir şema eşdeğerliği ya da kriptografik güvenlik kanıtı değildir**, yalnız daha sonra değişip değişmediğini karşılaştırmak içindir.

## 2. Migration geçmişi — isim eşleşmesi, SHA eşdeğerliği değil

| Hosted ledger sürümü | Hosted adı | GitHub kaynak dosyası (aday eşleştirme) |
| --- | --- | --- |
| 20261111161929 | cms_foundation | 20261111115015_cms_foundation.sql |
| 20261111163310 | cms_pages_media | 20261111162256_cms_pages_media.sql |
| 20261111163607 | cms_access_hardening | 20261111163454_cms_access_hardening.sql |
| 20261111164832 | cms_passwordless_provisioning | 20261111164757_cms_passwordless_provisioning.sql |
| 20261112131818 | cms_relations_media_lifecycle | 20261111214959_cms_relations_media_lifecycle.sql |

**Önemli:** Sürüm numaraları farklı; adların benzemesi SQL'in birebir aynı çalıştırıldığını kanıtlamaz. Hosted fonksiyonlar, tablolar, trigger'lar, policy/grant'ler ve migration tanımları karşılaştırılmadan **`db push`, `migration repair`, `db reset` veya önceki 5 SQL'i tekrar çalıştırma**.

**Altıncı ve henüz uygulanmamış migration:** `supabase/migrations/20261113013600_cms_direct_publication.sql`; uygulamadan önce hosted şema mutabakatı ve yedek gerekir.

## 3. Ücretsiz Supabase için gerçek yedek kapısı

Supabase Free planında otomatik günlük veritabanı yedeği yok. Supabase resmi dokümanında yerel `db dump` dışa aktarma ve geri yükleme öneriliyor.

Resmî kaynaklar:
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://supabase.com/docs/reference/cli/supabase-db-dump

Bunları tamamlamadan hosted migration/seed yapma:

1. **Yerel ve korumalı dizin:** Git repo, İndirilenler paylaşımı, CI artifact, GitHub PR veya herkese açık bir bağlantı değil; yalnız yerel cihazda yetkili kişiye açık, tercihen şifreli depolama kullan. Database bağlantı parolalarını terminal çıktısına, URL'ye, kaynak koda veya sohbet ekran görüntüsüne koyma.
2. **CLI help ve sürüm:** Kullanıcının cihazında Supabase CLI v3.1.0 `db dump --help` ile `--remote`, `--data-only`, `--role-only`, `--file` ve Docker gereksinimlerini doğrula. Bağlanılacak proje adı/ID'si mutlaka `uftnykormtwlzolwbhfb` olmalı. Başka projeye geçilmemeli.
3. **En az üç ayrı dosya:** roller, uygulama şeması ve uygulama verisi için `supabase db dump` (veya uygun `pg_dump`) çıktıları oluştur. Dosyaların boş olmadığını, export'un hata vermediğini, dosya SHA-256 özetlerini kontrol et. `db dump` varsayılan olarak Auth/Storage gibi Supabase-managed şemaları hariç tutabilir; bu üç dosyayı **tüm projeyi kapsayan yedek** diye etiketleme.
4. **Auth ve Storage ayrı korunur:** `auth.users` / Auth ilişkileri, `storage` metadata ve **gerçek Storage dosyaları** için ayrıca doğrulanmış koruma/geri yükleme planı gereklidir. SQL yedeği Storage dosya baytlarını içermez. Bu denetimde `cms-media` bucket'ında 0 nesne var, ama başka bucket ve gelecekteki yüklemeler için aynı varsayımı yapma.
5. **İzole geri yükleme kanıtı:** Gerçek hosted DB'yi sıfırlamadan, ayrı izole yerel PostgreSQL/Supabase fixture üzerinde restore gerçekleştir; 21/537, sürümler, temel güvenlik politikaları ve erişim haklarını karşılaştır. Auth bağlantılı metadata için platform uyumluluğu ayrıca doğrulanmalı. Yalnız SHA-256 ve dosya varlığı restore testi yerine geçmez.
6. **Yedek tamamlandı kaydı:** Dışa aktarma tarihi, CLI sürümü, proje ref'i, dosya boyutları/SHA-256 ve hangi şemaların/Storage nesnelerinin dahil olduğu gizli anahtar içermeyen kısa operatör kaydında tutulmalı. Bu kayıt görünene kadar gerçek veritabanında SQL yazma işlemi yapılmaz.

**Durum:** Bu sohbetten yalnız metaveri envanteri ve kod QA gerçekleştirilebildi. MCP Supabase bağlantısında full db dump/restore ve private Storage baytlarını dışa aktarma yeteneği yok; **gerçek hosted yedeğinin alındığı veya restore edildiği iddia edilmez**.

## 4. Kontrollü geçiş sırası

1. **Sıfır-dokunuş preflight** — `scripts/cms/hosted-readiness.sql` sonucu, tüm 5 migration ledger kaydı, RLS/trigger/role sayıları aynı proje üzerinden yeniden doğrulansın.
2. **Yedek + restore** — yukarıdaki gerçek yedek kapısı tamamlanmadan ilerleme.
3. **Migration drift uzlaştırması** — hosted `pg_get_functiondef`, tablo/constraint/trigger/policy tanımları ile kaynak 5 migration'ın beklenen postcondition'ları karşılaştırılıp farklılıklar kayda alınsın. Mevcut 5 migration'ı tekrar çalıştırma; migration geçmişini varsayımla `repair` etme.
4. **Yalnız altıncı migration** — doğrudan yayın sözleşmesini sağlamak için yalnız gözden geçirilmiş `20261113013600_cms_direct_publication.sql` kontrollü uygulanabilir; ardından `cms_private.allowed(true)`, `unpublish`, `review`/onay kaldırılması, yayın trigger'ları ve RLS test edilmeli.
5. **13 tekil içerik seed'i** — `scripts/cms/existing-content-seed.ts` varsayılan dry-run. `--write` ile SQL oluşturulabilir ama otomatik çalıştırılmaz. `ON CONFLICT(kind,slug) DO NOTHING` dışında overwrite yok; yeniden çalıştırıldığında ikinci kayıt oluşmadığını ve eski 21/537'nin korunduğunu denetle.
6. **Cloudflare staging** — doğrulanmış **PR #24 head SHA** bazlı tek aday Worker'a yüklenmeli. Dashboard'daki `CMS_ENABLED`, `CMS_ALLOWED_EMAILS`, `CMS_PUBLIC_READS`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` binding'leri korunmadan deploy edilmez; kör `--force` kesinlikle yok. Domain/DNS/prod değişmez.
7. **Gerçek CEO kabulü** — OTP/TOTP/QR, login/refresh/logout, 21 sayfa, 13 mevcut içerik, 9 site görseli ve doğrudan yükleme, kaydet/önizle/doğrudan yayın/yayından kaldır/geri al, mobil tarayıcı, yetkisiz erişim, Storage ve Workers CPU/cache/SMTP testleri.
8. **Kademeli yayın** — `CMS_PUBLIC_READS=false` kalır; test ve açık yayın kararı olmadan açma. Domain/DNS en son.

## 5. Çıkış / GO koşulları

- [x] Birleşik kod adayı #24; GitHub Actions Migration QA + CodeQL başarılı.
- [x] Hosted RLS/trigger/migration/rol/envanter metaverisi salt okunur doğrulandı.
- [ ] Gerçek host yedekleri, Auth/Storage kapsamı ve restore kanıtı.
- [ ] Hosted eski 5 migration için postcondition mutabakatı.
- [ ] Altıncı migration ve izinli 13 içerik aktarımı.
- [ ] Cloudflare gerçek Worker deploy + tüm CMS/CEO browser kabul testleri.
- [ ] Ücretsiz kota, performans, SMTP deliverability ve geriye dönüş provası.
- [ ] Açık üretim/domain onayı.

**Sonuç:** Kod QA'sı başarılıdır; hosted sistem şu anda eski doğrudan yayın sözleşmesi nedeniyle PR #24 ile uyumsuzdur. Bu dosya deploy izni değildir.
