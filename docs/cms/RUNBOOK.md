# Kurulum, kullanım ve geri dönüş

## Şu anki güvenli durum

`.env.example` CMS'i kapalı tutar. `CMS_ENABLED=false` veya eksik ayarlarda yönetim verisi 404; `/admin/login` kurulumun henüz açılmadığını söyler. Public site eski statik veri kaynağını kullanır.

## Staging ön koşulları

- Cloudflare ücretsiz hesap, domain sahipliği ve staging runtime doğrulaması. Ücretli Workers, KV/Images eklentisi veya overage açmayın. İzole vinext PoC static-assets cache, data-cache none, image optimization none ile derlendi; bu model **dinamik yayın cache çözümü olarak onaylanmadı**.
- Şirkete ait ücretsiz Supabase projesi ve ücretsiz özel SMTP; mevcut başka müşteri projelerini kullanmayın. Resmî kota: Free DB 500 MB, Storage 1 GB, egress 5 GB, düşük kullanımda bir hafta sonra pause; hesap başına aktif ücretsiz proje limiti de kontrol edilmeli.
- Resend aday Free 3.000/ay, 100/gün. Domain gönderici doğrulaması, MX/TXT kayıtlarının korunması, OTP teslim/spam/süre aşımı ve rate limit testi şart. Kart/ücretli aşım yok. DNS için açık onay alınmalı.

## Staging kurulumu (henüz yapılmadı)

1. SQL ve seed'i izole projede inceleyip uygulayın; advisors çalıştırın; API grant'leri/RLS negatif testlerini gerçek API üzerinden tekrarlayın. Prod DB'ye doğrudan uygulamayın.
2. Auth'ta public signup ve anonymous signup kapalı; davetli hesap oluşturun. Admin rol satırını yalnız yetkili DB operatörü eklesin; `user_metadata` rol kaynağı değildir.
3. OTP e-posta şablonu altı haneli `{{ .Token }}` kod; özel SMTP; OTP expiry (örn. 300 sn), yeniden gönderim en az 60 sn, Supabase rate limits ve CAPTCHA/abuse korumasını staging'de doğrulayın. Kodda yerel sayaç global rate limiter olarak sunulmaz. Form yanıtı hesap varlığı hakkında aynı mesajı verir; ağ zamanlaması sabit süre garantisi vermez.
4. `SUPABASE_URL`, publishable key, server-side `CMS_ALLOWED_EMAILS` ayarlanır. Service-role anahtarı kullanılmaz. CMS yalnız kabul sonrası etkinleştirilir; staging'de HTTPS cookie zorunluluğuna uygun çalışın.
5. `/admin/login`: OTP; `/admin/mfa`: TOTP uygulamasına manuel kurulum anahtarı, sonra kod. MFA olmadan içerik yok. Anahtarı ekran görüntüsüne/log'a almayın. Yeni cihaz/kayıp faktör kurtarma yalnız yetkili operatör üzerinden; kurtarma UI'si yok.
6. Yayıncı ve editör hesabıyla uçtan uca test: taslak → metin önizleme → inceleme → onay → yayın deposu → düzenleme → taslağın public snapshot'ı değiştirmemesi → geçmiş → taslak geri alma → arşiv. Bu akışın public site bağlantısı henüz geliştirilmeli.

## Abdullah için mevcut panelin sınırı

Yeni kayıt türünü seçin, alanları doldurun, taslak kaydedin. Bilinmeyen tarih boş kalır. Metni önizleme mevcut şablondaki sayfa önizlemesi değildir. İncelemeye gönderin; yayıncı ayrıca içeriği onaylar. Yayın deposu henüz kurumsal siteyi güncellemez. Mevcut 21 sayfanın metinleri "Mevcut sayfalar" içinde okunabilir, bölüm düzenleme henüz kapalıdır. Medya yükleme henüz yoktur. Bu geliştirme sürümünü bitmiş müşteri teslimi olarak sunmayın.

## Yedekleme / kesinti / geri dönüş

- Değişiklik öncesi veritabanı dump'ı ve dosyaları ayrı, erişimi korunan konumda saklayın; Free planda günlük otomatik backup varsaymayın. Role/Auth bilgilerini açık Git'e veya genel rapora koymayın. Staging geri yükleme denemesi yapılmadan yedekleme kabulü vermeyin.
- Pause/kota aşımında yönetim kapalı hata vermeli; public statik kaynak çalışmaya devam eder. Gelecekte cache/store bağlantısı için stale snapshot/rollback testi ayrıca gerekir.
- Erişim iptali: önce `cms_roles.active=false`, sonra oturumları revoke. Rol sorgusu ve SQL oturum kontrolü anlıktır; eski JWT'yi tek başına yetki saymaz.
- Kod geri dönüşü: PR merge edilmedikçe branch'i bırakın. İleride merge edilirse normal revert PR kullanın; force push, history rewrite veya veri silme yok. `CMS_ENABLED=false` bağımsız kapatma anahtarıdır. DB drop/rollback otomatik uygulanmaz; gerektiğinde reviewed restore planı gerekir.

## Resmî kaynaklar — 11.11.2026 kontrolü

- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- https://developers.cloudflare.com/workers/platform/limits/
- https://supabase.com/changelog.md (CLI v3 local varsayılanı, Free varsayılan SMTP şablon kısıtı incelendi)
- https://supabase.com/pricing
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-mfa/totp
- https://resend.com/pricing
- https://vercel.com/docs/plans/hobby (ticari şirket sitesi için Hobby seçilmedi)
