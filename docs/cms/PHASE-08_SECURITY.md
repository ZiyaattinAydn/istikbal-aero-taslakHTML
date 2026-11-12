# İSTİKBAL AEROSPACE — Aşama 8: CMS güvenlik denetimi ve sertleştirme

**Branch:** `feat/cms-security-controls`  
**Base:** `feat/cms-direct-publication` / PR #21  
**Durum:** Kod + izole CI. Canlı Supabase, Vercel, Cloudflare, DNS ve main değiştirilmedi.

## Denetlenen mevcut korumalar

- `requireAdmin()` gerçek `auth.getUser()` ile oturumu, aktif `cms_roles` ile rolü ve `mfa.getAuthenticatorAssuranceLevel()` ile AAL2'yi kontrol eder.
- `cms_private.allowed(true)` veritabanı fonksiyonu rol, AAL2 JWT ve `auth.sessions` kaydını doğrudan sorgular. Yayın, silme, medya izinleri ve sürüm işlemleri UI güvenine bırakılmaz.
- Tüm özel CMS belgeleri RLS ve tablo izinleriyle koruma altında; `cms_published` herkese açık yayın snapshot'ı, `cms_documents` özel taslaktır.
- Admin taslak sayfa önizlemesi yalnız aynı origin'den iframe olarak açılabilir; genel site frame-ancestors none, X-Frame-Options DENY ve noindex kullanır.
- Özel medya dosyaları AAL2 korumalı `/admin/media/:id/file` üzerinden, yayına açılmış görseller izin kontrolüyle `/cms-media/:id` üzerinden ve no-store yanıtlarıyla sunulur.
- Doğrudan yayın, özel/yayın hakkı olmayan medya referanslarını DB trigger'ında reddeder.
- GitHub QA üzerinde bağımlılık taraması, credentials taraması ve tarayıcı/test regresyonları bulunur.

## Tespit edilen eksikler ve yapılan değişiklikler

1. Yönetici tarayıcı oturumunun cookie `Max-Age` değeri **365 gün** idi. `src/lib/cms/cookie-policy.ts` altında server/proxy için tek bir **7 günlük** HttpOnly, SameSite=Lax, `/admin` path ve production Secure politikası tanımlandı. Bu cookie süresi Supabase oturum geçerliliğinin *yerine geçmez*.
2. OTP isteği sadece davetli adresler için yapılıyordu; fakat `verifyCode` davetli adres kontrolünü ayrı tekrarlamıyordu. Her iki aşama `allowedCmsEmail` kullanıyor. Dışarıya dönen başarısız doğrulama mesajı hesap varlığını açıklamaz.
3. MFA faktör doğrulama eylemi artık 6 haneli kod + UUID kontrolünü yapıyor ve faktörün mevcut kullanıcı Auth oturumunun `listFactors` listesinde **TOTP** olarak bulunduğunu teyit ediyor. Auth sunucusu asıl doğrulamayı yapmaya devam eder.
4. İlk MFA kurulumunda eski tamamlanmamış faktör temizliği başarısız olursa işlem sessizce devam etmek yerine açıklayıcı hata döndürüyor.
5. Otomatik testler, daha önce boş cookie listesiyle bile geçebilen kontrolü güçlendiriyor: cookie'nin gerçekten oluşması, HttpOnly, SameSite, path ve üst süre sınırı test ediliyor. OTP allowlist, private media, preview framing ve SQL AAL2/publisher kontrolleri statik ve gerçek oturumlu testlerle korunuyor.

## Bilinçli sınırlar

- Yeni `service_role` anahtarı veya client tarafında gizli anahtar kullanılmadı.
- RLS, SQL RPC, Storage bucket permission, doğrudan yayın ve 21 sayfalık içerik mimarisi değiştirilmedi.
- E-posta OTP'nin istek/doğrulama rate limit'i Supabase Auth servis politikasıdır. Arayüzde yazan "bir dakika" sunucu tarafında ayrıca garantilenmez. Gerçek staging'e geçmeden önce **Supabase Auth email OTP throttling, session max lifetime, SMTP deliverability, abuse metrics ve Cloudflare/WAF rate limits** kontrol edilmeli.
- Yalnız cookie süresini düşürmek, eski tarayıcılarda zaten verilmiş uzun ömürlü cookie'leri anında geçersiz kılmaz. Staging/canlı geçiş planında oturum yenileme veya kontrollü sign-out yapılmalı.
- Tam `script-src` CSP bu aşamada zorlanmadı; Next.js hydration ve sinematik animasyon uyumluluğu için ayrı nonce tabanlı çalışma gerekir. Mevcut frame-ancestors güvenliği korunur.
- Görsel yüklenip DB medya kayıt işlemi başarısız olursa private Storage'da yetkisiz olmayan **orphan** dosya oluşabilir; bu kota/operasyonel bakım riskidir. Rastgele DELETE politikası eklemek yerine staging operasyon prosedüründe tespit ve izinli temizlik ele alınmalıdır.

## Kabul

Tüm mevcut GitHub CI işleri: typecheck, lint, birim/PGlite SQL, 21 sayfa envanteri, build, production/dev tarayıcı, performans ve yerel Supabase Auth OTP/TOTP/RLS/Storage. Ek güvenlik testleri davetli email, bounded cookie, aktif role/MFA denetimi ve private media'ya anonim erişim engelini doğrular.

**Draft/NO-GO**: Birleştirme/yayın yok. Sonraki aşama 9: tüm PR'lar üzerinde uçtan uca QA, görsel/mobil regresyon ve release hazırlanması. Aşama 10: Cloudflare staging, DB backup/drift/migration ve CEO kullanıcı kabulü.
