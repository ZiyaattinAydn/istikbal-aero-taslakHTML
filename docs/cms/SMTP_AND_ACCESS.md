# Servis erişimi ve SMTP — 11 Kasım 2026 devam çalışması

## Gerçek erişim durumu

Bağımsız `istikbal-aerospace-cms` projesi `Ziyaattin.Dev` altında, Frankfurt bölgesinde oluşturuldu. Proje ref: `uftnykormtwlzolwbhfb`. Oluşturmadan önce araç aylık 0 USD fiyat döndürdü. Başka projeye migration uygulanmadı; ödeme/upgrade açılmadı.

Cloudflare ve Resend için kullanılabilir Work bağlantısı bulunamadı. Eklenti araması sonuç vermedi; tarayıcıda Cloudflare, Resend ve Supabase Dashboard oturum açma ekranına yönlendi. Kullanıcının kendi tarayıcısında GitHub ile hesap açması bu oturumda API/OAuth erişimi sağlamaz. Cloudflare staging dağıtımı yapılmadı; hosting NO-GO kararı korunur.

## Yönetici yetkisi

Kullanıcının verdiği e-posta yalnız yeni projenin **özel** `cms_private.admin_allowlist` tablosuna kaydedildi; kaynak koda ve açık seed'e eklenmedi. Onaylı e-posta ile oluşturulan ve e-postası doğrulanan kullanıcıya trigger `publisher` rolü atar. Bu rol mevcut sistemin tüm içerik/yayın/medya yetkilerini kapsar; MFA zorunluluğunu kaldırmaz.

**Hosted kullanıcı henüz provision edilmedi.** Bağlı araçta Auth Admin API/config ayarlama yeteneği ve tarayıcı oturumu yok; kullanıcı hesabını auth.users içine elle yazarak oluşturmuyoruz. Güvenilir Auth Admin API ile parola vermeden `createUser({email,email_confirm:true})` yapılmalı. Bu işlem e-posta göndermez. Gerçek kullanıcının TOTP sırrı kullanıcı tarafından kendi cihazında kurulmalı; rapora veya seed'e kaydedilmez.

Yeni hosted projede account guard, allowlist dışındaki kullanıcı kayıtlarını ve parola oluşturmayı DB katmanında reddeder. Local config'te `enable_signup=false` ve anonymous sign-in kapalıdır. Hosted Auth dashboard `disable_signup`, OTP süresi/şablonu ve MFA ayarları erişim geldiğinde ayrıca uygulanıp doğrulanmalı; bu servis ayarlarını yapılmış saymıyoruz. Kamuya açık CMS ve public DB okuma varsayılan kapalıdır.

## Yerel OTP

Supabase CLI 3.1.0 için `supabase/config.toml` ve altı haneli `templates/otp.html` hazır. Yerel gönderici Mailpit; Resend'e veya gerçek bir e-posta kutusuna gönderim yapılmaz. Test e-postası `cms-admin@example.com`, yalnız `local-admin.sql` fixture'ıdır; hosted projeye eklenmedi.

Çalışma ortamında Docker yok. Native CLI başlangıcı servis arşivlerini GitHub/S3'ten indiremedi (`EAI_AGAIN`); yerelde gerçek OTP tamamlandı iddiası yok. PR CI'daki `cms-local-auth` işi Docker tabanlı izole Supabase + Mailpit çalıştırır. Test, gerçek OTP e-postası/yanlış kod/tek kullanım, kapalı signup, TOTP, AAL1 reddi, AAL2 yazma, yayın, özel/public Storage ve eski JWT ile oturum iptalini doğrular. Başlangıç çıktısı anahtar içerebileceği için tamamen atılır; status JSON yalnız private geçici çalışma ayarıdır. Artifact yalnız sansürlenmiş sonuç JSON'udur. CI 43067794522 / dfa9266 turunda 15 gerçek yerel kontrol başarılıdır; ayrıntı evidence/local-auth-ci.json içindedir. Bu Mailpit teslimidir; Resend veya gerçek posta kutusu teslimi değildir.

## Resend Free hazırlığı

Tercih edilen yol [resmî Resend–Supabase entegrasyonu](https://supabase.com/partners/catalog/resend). [Resend integrations](https://resend.com/settings/integrations) ekranında yalnız yeni proje seçilerek SMTP bağlantısı kurulabilir; anahtarları elle kopyalamak gerekmez. Work bu hesap oturumuna henüz erişemediği için entegrasyon **kurulmadı**.

`supabase/resend-smtp.example.toml` yalnız kapalı bir referanstır; local Mailpit config'ine yüklenmez. Supabase Auth e-postaları için uygulamaya Resend SDK veya tarayıcı anahtarı gerekmez. SMTP kimliği Resend/Supabase'in özel ayarlarında saklanır. Anahtarı konuşmaya, repo'ya, Actions log/artifact'ına veya rapora eklemeyin.

Gönderici domain doğrulaması, SPF/DKIM/DMARC ve mevcut MX/TXT'nin korunması son DNS aşamasına bırakıldı. Doğrulanmamış domainle teslim/spam/üretim OTP kabulü yok. Free kota ve ücretli aşımın kapalı olduğu domain aşamasında tekrar kontrol edilmeli; kart/ek ücret açılmayacak.

## Sonraki dış adımlar

1. Supabase Auth Admin ve konfigürasyon erişimi: davetli kullanıcıyı provision et, hosted signup/OTP/MFA ayarlarını doğrula.
2. Cloudflare hesabı için kullanılabilir Work bağlantısı veya ortamda güvenli, dar kapsamlı yetki: ücretsiz staging CPU/cache/auth/upload testi.
3. Resend OAuth/resmî entegrasyon bağlantısı; gerçek gönderici doğrulaması ve teslim testleri DNS aşamasında.
4. DNS, canlı yayın ve main merge ayrı açık onay gerektirir. Bu çalışma bunları gerçekleştirmedi.

## Auth Admin uyumluluk düzeltmesi

İlk gerçek CLI testi kullanıcı hazırlığında durdu. Resmî Auth kaynak kodu, parolasız `createUser` çağrısında dahi dahili rastgele parola üretildiğini gösterdi. İlk guard bu hazırlığı fazla katı engelliyordu. Ek migration, hesap oluşturulurken bu hash’i boşaltır; sonradan parola etkinleştirmeyi reddeder. OTP ve TOTP kontrolleri korunur; anonim veya parola tabanlı giriş açılmaz. Kaynak: https://github.com/supabase/auth/blob/master/internal/api/admin.go . Son CLI CI turunda bu hazırlık ve ardından OTP/TOTP akışı başarılıdır.

## Gerçek Mailpit kabulü ve CLI başlangıç düzeltmesi

İlk turlarda CLI Auth, şablon sunucusu hazır olmadan varsayılan giriş bağlantısı şablonunu önbelleğe alıyordu. Mailpit'te varsayılan bağlantı gözlendi; OTP kabulü verilmedi. `prepare-local-auth.mjs` dört yerel endpoint'in kaynak OTP şablonunu eksiksiz sunduğunu doğrular; sonra yalnız izole local Auth'u yeniden başlatarak bu fallback cache'ini temizler. Hosted ayara veya güvenlik politikasına dokunmaz. Resmî kaynaklar: https://supabase.com/kb/troubleshooting/email-template-not-updating ve https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/commands/start/services/gotrue.service.ts .

Son CI'da gerçek özel şablon, altı haneli kod, yanlış kod/tekrar reddi ve TOTP başarılı; AAL1 yazma reddi, AAL2 yayın, private/public Storage ve iptal edilmiş oturumun eski JWT ile yazamaması da geçti. Native çalışma ortamı engelini Docker CI ile aştık. Hosted kullanıcının MFA kurulumu ve gerçek SMTP hâlâ bekler.

## 12 Kasım erişim kontrolü

Mevcut proje ACTIVE_HEALTHY, Auth kullanıcı sayısı 0. MCP'de Auth Admin/config aracı ve ortamda güvenli anahtar yok. Cloudflare/Resend plugin araması boş, servis tarayıcıları login ekranında. Aynı bağlantılar tekrar denenmedi. cms:admin:provision güvenli operatör script'i eklendi; eksik kimlikte hiçbir işlem yapmadan durduğu doğrulandı. Gerçek kullanıcı oluşturulmadı. [ACCESS_STEPS.md](ACCESS_STEPS.md) bağlantılar/adımlar ve DNS yapmama sınırıdır. İlk SQL araç onayı expired oldu; tek tekrar başarılıdır. Yeni migration uygulandı, eski dördü tekrar edilmedi.

## Son entegrasyon doğrulaması — 12 Kasım

Resmî https://supabase.com/partners/catalog/resend sayfası yeniden doğrulandı: entegrasyon proje için özel anahtar oluşturup Supabase SMTP ayarlarını doldurabiliyor. Ancak bu Work oturumunda Resend ve Supabase dashboard giriş ekranında; SMTP/Admin/config yetkisi yok. Entegrasyon kurulmadı, e-posta gönderilmedi ve hosted kullanıcı oluşturulmadı. Yerel Mailpit kabulü gerçek teslim kabulünden ayrı kalır. Mevcut kapalı SMTP referansı ve Token şablonu korundu; uygulamaya SDK veya gizli anahtar eklenmedi. Domain doğrulaması/otomatik Cloudflare DNS adımı çalıştırılmadı. Kesin erişim adımları ACCESS_STEPS.md, teslim kapıları FINAL_INTEGRATION_REPORT.md içindedir.
