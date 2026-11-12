# Servis erişimi ve son kurulum adımları — 12 Kasım 2026

Bu tur tek erişim kontrolü yapıldı: Supabase MCP proje/SQL/advisors erişimi var; Auth Admin/config aracı yok. Proje ACTIVE_HEALTHY, 21 sayfa/537 alan ve private bucket korunuyor; hosted kullanıcı sayısı 0. Cloudflare/Resend eklenti araması sonuç vermedi. Üç servisin Work tarayıcısı giriş ekranında; ortamda ilgili özel kimlikler yok. Tekrar bağlantı denemesi yapılmadı. Hosting **NO-GO**.

## Cloudflare — yalnız ücretsiz staging

1. Work içindeki servis tarayıcısında Cloudflare oturumu açılmalı; kendi bilgisayarındaki oturum buraya aktarılmaz. Alternatif: [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) üzerinden yalnız ilgili hesabı kapsayan kısa ömürlü bir Workers token'ı oluştur. Workers Scripts Edit / gereken hesap okuma izinleri yeterlidir; DNS/Zone, KV, R2, Images veya D1 yazma izni ekleme.
2. Token'ı konuşmaya veya dosyaya yapıştırma. Güvenli çalışma ortamı secret alanı varsa `CLOUDFLARE_API_TOKEN`, hesap kimliği için `CLOUDFLARE_ACCOUNT_ID` tanımla. Böyle bir alan yoksa token paylaşmadan tarayıcı oturumunu kullan. GitHub ile giriş yapmak tek başına bu yetkiyi sağlamaz.
3. Hesabın Workers **Free** olduğu ve ek ödeme/abonelik açılmadığı doğrulanmalı. `npm run cms:hosting:prepare` yalnız geçici, ayrı bir dizinde aday yapılandırma hazırlar; kaynak repo/production runtime'ı dönüştürmez ve deploy yapmaz. Kurulum çıktısındaki dizinde dependency install/check/build/audit yapılır.
4. Adayın adı `istikbal-cms-staging`; yalnız workers.dev test adresi kullanılmalı. DNS, custom domain veya route bağlama. KV, R2, Images, Response Store veya ücretli eklenti oluşturulmaz. Data cache şu an unprovisioned: bu yapılandırma dinamik yayın/cache kabulü değildir.
5. Erişim sonrası CPU, cache/tag invalidation, OTP/TOTP cookies, Server Actions, medya yükleme/izin geri çekme ve kota testleri yapılmalı. Gerçek kanıt gelmeden GO yok. Tamamlanmamış cache politikasını ücretli servis açarak çözmeyin.

Resmî rehber: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/ ve https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/ .

## Supabase — mevcut proje ve ilk yönetici

1. [Mevcut proje](https://supabase.com/dashboard/project/uftnykormtwlzolwbhfb) için Dashboard/Auth Admin erişimi gerekli. Yeni proje açmayın; auth.users içine SQL INSERT yapmayın.
2. Yetkili operatör, yalnız bu projenin service-role/secret anahtarını kendi güvenli ortamında `SUPABASE_SERVICE_ROLE_KEY`, yetkilendirilmiş e-postayı `CMS_BOOTSTRAP_EMAIL` olarak tanımlayıp `npm run cms:admin:provision` çalıştırabilir. Script sabit proje URL'sini kullanır, önce mevcut hesabı arar, yoksa parolasız `admin.createUser({email,email_confirm:true})` çağırır; özel allowlist trigger'ının publisher rolünü verdiğini doğrular. E-posta/anahtar/UUID loglamaz ve posta göndermez. İş bitince özel anahtarı ortamdan kaldırın; uygulama runtime'ına koymayın.
3. Publisher mevcut sistemin bütün içerik/yayın/medya yetkileridir. Kullanıcı oluşturma, rol verme ve faktör kurtarma operatör işlemi olarak kalır; public admin uygulamasına Auth Admin anahtarı verilmez.
4. Auth ayarlarında public signup ve anonymous giriş kapalı; OTP 6 hane / 300 saniye; yeniden gönderim en az 60 saniye; TOTP açık olmalı. Bu hosted servis ayarları erişim olmadan uygulanmış sayılmaz. Kullanıcı kendi doğrulama uygulamasını kendisi kurar.
5. SQL/migration geçmişi kontrol edilir; eski dört migration yeniden körlemesine uygulanmaz. Lifecycle migration önceki turda bir kez başarıyla uygulandı (hosted 20261112131818). Yeniden uygulamayın. Sonraki migration yalnız doğrulandıktan sonra bu projeye bir kez uygulanır. Dosya ve hosted timestamp'leri MCP uygulamasında farklı olabildiğinden isim/içerik birlikte karşılaştırılmalıdır.

## Resend — resmî entegrasyon, DNS en son

1. [Resend Integrations](https://resend.com/settings/integrations) hesabında oturum aç. [Resmî Supabase entegrasyonunu](https://supabase.com/partners/catalog/resend) seç, yalnız `istikbal-aerospace-cms` projesini eşleştir. Entegrasyon SMTP anahtarını ve ayarlarını sağlayıcılar arasında özel olarak aktarır; GitHub'a anahtar yazılması gerekmez.
2. Free planı koru. Kart ekleme, Pro/overage açma. SMTP için uygulamaya Resend SDK eklenmez; `supabase/resend-smtp.example.toml` kapalı referanstır.
3. **Connect Cloudflare / otomatik DNS ekleme** adımını şimdi çalıştırma. Gönderici domain doğrulaması, SPF/DKIM/DMARC ve mevcut MX/TXT'nin korunması ayrı son aşamadır. DNS onayı gelene kadar gerçek gönderim kabulü verilmez.
4. DNS aşamasında gerçek OTP teslim/spam/gecikme/süre aşımı/yanlış kod ve rate-limit test edilir. Başarısız teslimi güvenliği kapatarak çözmeyin.

Bu erişimler tamamlandığında dahi canlı yayın, şirket domain bağlantısı ve main merge ayrı açık onay gerektirir. Yerel Mailpit ve izole CI testleri gerçek Resend/Cloudflare kabulünün yerine geçmez.

## Son entegrasyon kontrolü

12 Kasım tekrar kontrolünde önceki durum değişmedi: Supabase MCP SQL/health/history erişimi çalışıyor, Auth Admin/config erişimi yok; hosted kullanıcı hâlâ 0. Cloudflare/Resend plugin bulunmadı, özel ortam değişkenleri boş ve Work tarayıcısındaki üç panel giriş ekranında. Aynı bağlantılar tekrar denenmedi.

Öncelikli kullanıcı işlemi: Work içindeki ilgili servis sekmesinde oturum açılması veya özel operatör ortamının güvenli kurulması. Anahtarı sohbete yapıştırmayın. Önce Supabase Auth/Admin ve Resend entegrasyonu; ardından Free workers.dev staging erişimi. Şirket domain DNS adımını bekletin. Hesaplarda oturum açılması kendi başına ücret veya DNS yetkisi vermez.

Cloudflare staging kabulünde güncel resmî Free sınırları: HTTP isteği başına **10 ms CPU**, günde **100.000 istek**, 128 MB bellek. Ağ bekleme süresi CPU değildir; yerel save/gezinme süresi ile karşılaştırmayın. Hesabın gerçekten Free olması ayrıca panelden doğrulanmalı; CPU sorunu çıkarsa Paid açmayın. https://developers.cloudflare.com/workers/platform/limits/

Yedek operatör adımları: [BACKUP_AND_RESTORE.md](BACKUP_AND_RESTORE.md). Hosted tam DB yedeği ve Auth/Storage uyumlu yerel restore henüz kabul edilmedi.
