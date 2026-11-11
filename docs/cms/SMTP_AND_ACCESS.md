# Servis erişimi ve SMTP — 11 Kasım 2026 devam çalışması

## Gerçek erişim durumu

Bağımsız `istikbal-aerospace-cms` projesi `Ziyaattin.Dev` altında, Frankfurt bölgesinde oluşturuldu. Proje ref: `uftnykormtwlzolwbhfb`. Oluşturmadan önce araç aylık 0 USD fiyat döndürdü. Başka projeye migration uygulanmadı; ödeme/upgrade açılmadı.

Cloudflare ve Resend için kullanılabilir Work bağlantısı bulunamadı. Eklenti araması sonuç vermedi; tarayıcıda Cloudflare, Resend ve Supabase Dashboard oturum açma ekranına yönlendi. Kullanıcının kendi tarayıcısında GitHub ile hesap açması bu oturumda API/OAuth erişimi sağlamaz. Cloudflare staging dağıtımı yapılmadı; hosting NO-GO kararı korunur.

## Yönetici yetkisi

Kullanıcının verdiği e-posta yalnız yeni projenin **özel** `cms_private.admin_allowlist` tablosuna kaydedildi; kaynak koda ve açık seed'e eklenmedi. Onaylı e-posta ile oluşturulan ve e-postası doğrulanan kullanıcıya trigger `publisher` rolü atar. Bu rol mevcut sistemin tüm içerik/yayın/medya yetkilerini kapsar; MFA zorunluluğunu kaldırmaz.

**Hosted kullanıcı henüz provision edilmedi.** Bağlı araçta Auth Admin API/config ayarlama yeteneği ve tarayıcı oturumu yok; kullanıcı hesabını auth.users içine elle yazarak oluşturmuyoruz. Güvenilir Auth Admin API ile parola vermeden `createUser({email,email_confirm:true})` yapılmalı. Bu işlem e-posta göndermez. Gerçek kullanıcının TOTP sırrı kullanıcı tarafından kendi cihazında kurulmalı; rapora veya seed'e kaydedilmez.

Yeni hosted projede account guard, allowlist dışındaki kullanıcı kayıtlarını ve parola oluşturmayı DB katmanında reddeder. Local config'te `enable_signup=false` ve anonymous sign-in kapalıdır. Hosted Auth dashboard `disable_signup`, OTP süresi/şablonu ve MFA ayarları erişim geldiğinde ayrıca uygulanıp doğrulanmalı; bu servis ayarlarını yapılmış saymıyoruz. Kamuya açık CMS ve public DB okuma varsayılan kapalıdır.

## Yerel OTP

Supabase CLI 3.1.0 için `supabase/config.toml` ve altı haneli `templates/otp.html` hazır. Yerel gönderici Mailpit; Resend'e veya gerçek bir e-posta kutusuna gönderim yapılmaz. Test e-postası `cms-admin@example.test`, yalnız `local-admin.sql` fixture'ıdır; hosted projeye eklenmedi.

Çalışma ortamında Docker yok. Native CLI başlangıcı servis arşivlerini GitHub/S3'ten indiremedi (`EAI_AGAIN`); yerelde gerçek OTP tamamlandı iddiası yok. PR CI'daki `cms-local-auth` işi Docker tabanlı izole Supabase + Mailpit çalıştırır. Test, gerçek OTP e-postası/yanlış kod/tek kullanım, kapalı signup, TOTP, AAL1 reddi, AAL2 yazma, yayın, özel/public Storage ve eski JWT ile oturum iptalini doğrular. Başlangıç çıktısı anahtar içerebileceği için tamamen atılır; status JSON yalnız private geçici çalışma ayarıdır. Artifact yalnız sansürlenmiş sonuç JSON'udur. CI sonucu STATUS.md/PR'da takip edilir.

## Resend Free hazırlığı

Tercih edilen yol [resmî Resend–Supabase entegrasyonu](https://supabase.com/partners/catalog/resend). [Resend integrations](https://resend.com/settings/integrations) ekranında yalnız yeni proje seçilerek SMTP bağlantısı kurulabilir; anahtarları elle kopyalamak gerekmez. Work bu hesap oturumuna henüz erişemediği için entegrasyon **kurulmadı**.

`supabase/resend-smtp.example.toml` yalnız kapalı bir referanstır; local Mailpit config'ine yüklenmez. Supabase Auth e-postaları için uygulamaya Resend SDK veya tarayıcı anahtarı gerekmez. SMTP kimliği Resend/Supabase'in özel ayarlarında saklanır. Anahtarı konuşmaya, repo'ya, Actions log/artifact'ına veya rapora eklemeyin.

Gönderici domain doğrulaması, SPF/DKIM/DMARC ve mevcut MX/TXT'nin korunması son DNS aşamasına bırakıldı. Doğrulanmamış domainle teslim/spam/üretim OTP kabulü yok. Free kota ve ücretli aşımın kapalı olduğu domain aşamasında tekrar kontrol edilmeli; kart/ek ücret açılmayacak.

## Sonraki dış adımlar

1. Supabase Auth Admin ve konfigürasyon erişimi: davetli kullanıcıyı provision et, hosted signup/OTP/MFA ayarlarını doğrula.
2. Cloudflare hesabı için kullanılabilir Work bağlantısı veya ortamda güvenli, dar kapsamlı yetki: ücretsiz staging CPU/cache/auth/upload testi.
3. Resend OAuth/resmî entegrasyon bağlantısı; gerçek gönderici doğrulaması ve teslim testleri DNS aşamasında.
4. DNS, canlı yayın ve main merge ayrı açık onay gerektirir. Bu çalışma bunları gerçekleştirmedi.
