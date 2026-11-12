# Son entegrasyon ve kullanıcı kabulüne hazırlık — 12 Kasım 2026

**Karar: kod ve izole testler hazır; gerçek servis/üretim kabulü NO-GO.** Cloudflare staging, hosted ilk yönetici, SMTP ve hosted tam yedek geri yükleme doğrulanmadan CMS açılmaz. Bu görev yeni CMS geliştirmedi; mevcut sistemi ve CI'ı doğruladı, eksik yedekleme/teslim araçlarını tamamladı.

## Tamamlananlar

- Mevcut `feat/cms-foundation` ve PR #13 kurtarıldı. Başlangıç `f8066a6ecd69098e143f3597832782ac565fc0e2`; rapor commit'inin [Migration QA](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43226877965) ve [CodeQL](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43226878100) sonuçları başarılı.
- Önceki belgeler ve çalışan altyapı korundu: 21 sayfa/537 alan, CRUD/taslak, gerçek şablon önizleme, yayın/arşiv/sürüm, ilişkiler, kapak/medya ve OTP+TOTP/RLS.
- Mevcut Supabase proje sağlığı, beş migration, allowlist, 21/537 ve doğrudan medya visibility UPDATE yasağı salt okunur doğrulandı; security advisors 0 bulgu. Yeni migration uygulanmadı.
- Repo dışında özel medyayı sayfalayarak yedekleyen, boyut/hash/önce-sonra envanter denetimli ve uzak veriye yazmayan operatör aracı hazır. Yeni dependency veya public bundle değişikliği yok.
- İkinci izole PostgreSQL/PGlite instance'ına fixture veri dizini restore edildi. Sayfa/alan/sürüm/yayın/ilişki/audit/rol eşitliği ve restore sonrası anon/AAL1/AAL2/rol iptali/sürüm geri alma geçti. Bozuk, eksik ve yol taşması içeren medya paketleri reddedildi.
- Mevcut CLI/Mailpit CI akışına gerçek **yerel** Storage yedekleme → farklı yola geri yükleme → hash ve anonim erişim reddi kontrolü eklendi. Hosted Storage verisi testte kullanılmaz.

## Servisler

| Servis | Gerçek durum | Açık kabul |
|---|---|---|
| Supabase DB | ACTIVE_HEALTHY, mevcut hedef erişilebilir, şema/RLS advisor temiz | Auth Admin/config aracı ve özel anahtar yok; kullanıcı 0 |
| İlk yönetici | E-posta private allowlist'te; güvenli idempotent Auth Admin script'i hazır | Parolasız hesap oluşturma + aktif publisher doğrulaması; hosted login ve kullanıcının kendi cihazında TOTP kurulumu |
| Hosted Auth | Uygulama shouldCreateUser=false, DB allowlist/parola guard, AAL2/rol/session denetimi korunur | Servis düzeyinde public signup/anonymous kapatma, OTP süre/rate-limit, TOTP ve cookie kabulü doğrulanmadı |
| Cloudflare | Tek sistematik plugin/env/browser kontrolü: erişim yok; aday staging build önceki turda başarılı | Gerçek Free hesap/Workers runtime, workers.dev adresi, CPU/cache/Server Actions/oturum/upload kabulü yok. **Staging URL yok.** |
| Resend | Resmî entegrasyon doğrulandı; kapalı SMTP referansı/Token şablonu hazır | Hesap oturumu ve özel entegrasyon yetkisi yok; SMTP kurulmadı, gerçek teslim testi yok. Domain DNS en son |

Başka Supabase projesi kullanılmadı. Hosted Auth'a SQL kullanıcı eklenmedi. Service-role uygulamaya konmadı. Tarayıcıdaki üç servis login duvarındaydı; aynı başarısız bağlantılar tekrar edilmedi. GitHub ile giriş bağlantısı Work servis oturumu/API yetkisi yerine sayılmadı.

## Testler ve kullanıcı akışları

| Kontrol | Kanıt / sonuç |
|---|---|
| Yerel unit/SQL/SSR/snapshot/güvenlik | **58/58**, typecheck, lint, production build, dört CMS içerik doğrulaması başarılı |
| Bağımlılık denetimi | npm audit: **0 açık**; root package/lock değişmedi |
| Başlangıç commit CI | checks, local Auth/UI, dev/prod Chromium ve performans başarılı; CodeQL başarılı |
| Gerçek yerel yönetici UI | Önceki completion-admin-ui.json: OTP/MFA, 21 sayfa edit/save/preview/publish/restore/republish, haber/proje, görsel/ilişki/izin geri çekme, mobil/focus/logout geçti |
| Yeni restore/bütünlük testleri | İzole fixture DB restore + medya arşiv izin/hash/eksik dosya/yol/limit testleri geçti |
| Genişletilmiş gerçek yerel Storage testi | PR CI `cms-local-auth` işinde doğrulanacak; sonucu son CI kaydı belirler |
| Gerçek hosted yönetici ve mobil cihaz | **Bloke / yapılmadı**. Yerel sentetik hesap gerçek ilk yönetici değildir |
| Cloudflare/Resend uçtan uca | **Bloke / yapılmadı** |

Bu ortamda Docker ve çalışır Chromium bulunmadığı için gerçek servis tarayıcı testlerini yerelmiş gibi raporlamadık; mevcut GitHub CI bu işleri izole runner'da gerçekleştirir. Yeni commit'in CI sonucu PR kontrollerinde takip edilir. Uygulama tasarımı/animasyon/public runtime bu tur değiştirilmedi; fiziksel cihaz ve insan kabulü hâlâ açık.

## Performans

| Ölçüm | Referans / güncel kabul |
|---|---|
| Kaydetme ortanca / p95 | **318 / 441 ms**, 21 örnek, önceki gerçek Next development + local Supabase UI |
| Gezinme ortanca / p95 | **357 / 612 ms**, aynı yerel koşullar |
| Public bundle | Önceki browser encoded 145.974 → 147.188 byte; **+1.214 byte (~%0,83)**. Bu tur public kaynak/bağımlılık değişmedi |
| LCP / CLS | Önceki main kıyasında LCP farkı -12…+20 ms, masaüstü CLS en çok ~0,0192 / mobil 0; 7 rota × 2 viewport × 3 örnek, throttling yok, CMS_PUBLIC_READS=false |
| Hosted DB tek sorgu | Anon read-only published-page sorgusu index scan, planning 4,404 ms / execution 0,730 ms; **0 satır**, ağ/PostgREST/Worker zamanı değil |
| Staging LCP/CLS/INP, CPU, cache, save/publish | **Ölçülmedi**. Gerçek Workers/Supabase yük kabulü yok; saha INP yok |

Bu sayılar production SLA değildir. Next etiketli cache/React request dedupe ve toplu kart metadata sorguları korunur. Gerçek Free Worker sınırları altında dinamik cache ve izin geri çekme davranışı doğrulanmadan hosting GO verilmez. Ayrıntı ve ham kanıtlar: [PERFORMANCE.md](PERFORMANCE.md).

## Güvenlik, yedek ve geri dönüş

OTP+TOTP, AAL2, anlık rol ve DB oturum kontrolü, RLS, private bucket, kontrollü yayın ve no-store medya geri çekme korunur. Hosted güvenlik advisor'ının temiz olması hosted Auth ayarlarının veya SMTP tesliminin doğrulandığı anlamına gelmez. İlk yönetici publisher rolü tüm mevcut içerik/medya/onay/yayın yetkilerini kapsar; kullanıcı/rol/faktör yönetimi özel operatör işi kalır.

Free günlük otomatik DB yedeği varsayılmadı. [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md) DB + özel dosya + Auth/Storage özel güvenlik değişiklikleri + ayar kasası paketini, ücretsiz saklama ve geri dönüş adımlarını tanımlar. Fixture restore geçti; **hosted tam export ve Auth/Storage uyumlu yerel restore, RPO/RTO ve eski oturum iptali kabulü açık**. Gerçek restore veya veriye zarar veren işlem yapılmadı. Hatalı yayın sürümden yeni taslağa geri alınır; migration için otomatik down/drop/reset yoktur.

## Kullanıcının sıradaki işlemleri

1. [Mevcut Supabase projesinde](https://supabase.com/dashboard/project/uftnykormtwlzolwbhfb/auth/users) Work oturumunda giriş yapın veya güvenli özel operatör ortamını hazırlayın. `npm run cms:admin:provision` ile yalnız yetkili e-postayı parolasız oluşturun; script aktif publisher rolünü doğrular. Anahtarı konuşmaya/GitHub'a yapıştırmayın. Hosted signup/anonymous/OTP/TOTP ayarlarını [ACCESS_STEPS.md](ACCESS_STEPS.md) sırasıyla doğrulayın.
2. [Resend Integrations](https://resend.com/settings/integrations) içinden resmî Supabase entegrasyonunu yalnız mevcut projeyle bağlayın. Free planı koruyun. Otomatik Cloudflare/DNS adımını çalıştırmayın; gerçek domain doğrulaması ve OTP teslim/spam/gecikme testleri son ayrı aşama.
3. [Cloudflare](https://dash.cloudflare.com/) Work tarayıcısında oturum açın veya yalnız staging Workers yetkili kısa ömürlü token'ı özel ortamda sağlayın. Free planı doğrulayın; mevcut aday yapılandırmayla yalnız workers.dev ortamını açıp CPU/cache/Auth/Storage yük kabulünü tamamlayın. DNS/Zone, ücretli KV/R2/Images açmayın.
4. Gerçek SMTP hazır olduğunda kendi hesabınızla OTP giriş yapıp **kendi cihazınızda TOTP** kurun. 21 sayfada insan kullanıcı kabulünü ve fiziksel mobil cihaz kontrolünü tamamlayın; şirket içeriğini test amacıyla değiştirmeyin.
5. Özel DB erişimiyle hosted yedeği alın ve yalnız izole yerel ortama restore provası yapın. Tam kabul olmadan canlı yayın onayı vermeyin.

Kesin bağlantı/yetki/kurulum adımları [ACCESS_STEPS.md](ACCESS_STEPS.md), günlük kullanım [RUNBOOK.md](RUNBOOK.md) içindedir.

## Canlı yayın için son kontrol listesi

- [ ] İlk hosted yönetici, aktif publisher ve kendi cihazında TOTP doğrulandı.
- [ ] Hosted signup/anonymous kapalı, OTP süre/rate-limit, erişim iptali ve cookies geçti.
- [ ] Resend Free entegrasyonu ve ayrı DNS onayı sonrası gerçek teslim/spam testleri geçti.
- [ ] Ücretsiz workers.dev staging; CPU/istek limiti, cache-hit/miss/invalidation, Auth/Actions/upload/medya iptali geçti.
- [ ] Gerçek staging public/admin/mobil performans ve kullanıcı kabulü tamamlandı.
- [ ] Hosted tam yedek + izole geri yükleme, dosya hash'leri ve oturum iptali/RPO/RTO kabul edildi.
- [ ] Son kod commit'i CI/CodeQL yeşil; bilinen ürün sınırları kabul edildi.
- [ ] **Kullanıcıdan ayrıca canlı yayın/main merge ve gerekiyorsa DNS onayı alındı.**

PR: https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/13 . Yeni PR, ücret, DNS değişikliği, main merge veya production deploy yapılmadı. CMS_ENABLED=false ve CMS_PUBLIC_READS=false korunur.
