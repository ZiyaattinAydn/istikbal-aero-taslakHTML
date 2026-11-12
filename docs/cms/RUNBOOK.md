# Kurulum, kullanım ve geri dönüş

## Şu anki güvenli durum

`.env.example` CMS'i kapalı tutar. `CMS_ENABLED=false` veya eksik ayarlarda yönetim verisi 404; `/admin/login` kurulumun henüz açılmadığını söyler. Public site eski statik veri kaynağını kullanır.

## Staging ön koşulları

- Cloudflare ücretsiz hesap, domain sahipliği ve staging runtime doğrulaması. Ücretli Workers, KV/Images eklentisi veya overage açmayın. İzole vinext PoC static-assets cache, data-cache none, image optimization none ile derlendi; bu model **dinamik yayın cache çözümü olarak onaylanmadı**.
- Şirkete ait ücretsiz Supabase projesi ve ücretsiz özel SMTP; mevcut başka müşteri projelerini kullanmayın. Resmî kota: Free DB 500 MB, Storage 1 GB, egress 5 GB, düşük kullanımda bir hafta sonra pause; hesap başına aktif ücretsiz proje limiti de kontrol edilmeli.
- Resend aday Free 3.000/ay, 100/gün. Domain gönderici doğrulaması, MX/TXT kayıtlarının korunması, OTP teslim/spam/süre aşımı ve rate limit testi şart. Kart/ücretli aşım yok. DNS için açık onay alınmalı.

## Staging kurulumu ve kalan kabul

1. Yeni bağımsız Free projede dört migration, 21 sayfa/537 alan ve private Storage uygulandı; security advisors temiz. Hosted Auth/API ve staging kabulünü tamamlayın. Başka projeyi kullanmayın.
2. Auth'ta public signup ve anonymous signup kapalı; davetli hesap oluşturun. Özel allowlist'teki doğrulanmış hesaba trigger publisher rolü verir; user_metadata rol kaynağı değildir. Hosted kullanıcı henüz provision edilmedi.
3. OTP e-posta şablonu altı haneli `{{ .Token }}` kod; özel SMTP; OTP expiry (örn. 300 sn), yeniden gönderim en az 60 sn, Supabase rate limits ve CAPTCHA/abuse korumasını staging'de doğrulayın. Kodda yerel sayaç global rate limiter olarak sunulmaz. Form yanıtı hesap varlığı hakkında aynı mesajı verir; ağ zamanlaması sabit süre garantisi vermez.
4. `SUPABASE_URL`, publishable key, server-side `CMS_ALLOWED_EMAILS` ayarlanır. Service-role anahtarı kullanılmaz. CMS yalnız kabul sonrası etkinleştirilir; staging'de HTTPS cookie zorunluluğuna uygun çalışın.
5. `/admin/login`: OTP; `/admin/mfa`: TOTP uygulamasına manuel kurulum anahtarı, sonra kod. MFA olmadan içerik yok. Anahtarı ekran görüntüsüne/log'a almayın. Yeni cihaz/kayıp faktör kurtarma yalnız yetkili operatör üzerinden; kurtarma UI'si yok.
6. Yayıncı ve editör hesabıyla uçtan uca test: taslak → gerçek şablon önizleme → inceleme → onay → yayın → düzenleme → taslağın public snapshot'ı değiştirmemesi → geçmiş → taslak geri alma → arşiv. Public bağlantı kodu hazırdır; hosting GO olmadan etkinleştirilmez.

## İçerik düzenleme

1. **Sayfalar** listesinden sayfayı seçin. SEO, metin, kart, bağlantı ve izinli görsel alanları mevcut değerleriyle doludur. Alan aramasını kullanın; serbest HTML/CSS yoktur.
2. Düzenleyip **Taslak kaydet** seçin. Sunucu onayı gelmeden kaydedildi mesajı verilmez. Sürüm çakışmasında kaydı yeniden açıp değişiklikleri karşılaştırın.
3. **Gerçek şablonda önizle** kayıtlı taslağı yeni sekmede açar. Kaydedilmemiş metinler önizlemeye girmez. Mevcut sayfa ve yeni kayıt önizlemesi public görünümle aynı React bileşenidir; admin/MFA korumasındadır.
4. İncelemeye gönderin; yayıncı yalnız şirketin teyit ettiği içeriği onaylayıp yayımlar. Sürüm geçmişinden geri alma yeni taslak üretir; yayını hemen değiştirmez. Yayını kaldırmak için arşivleyin.
5. Yeni haber/proje/platform/teknoloji/kabiliyet türünü seçin. Tarih bilinmiyorsa boş bırakın. URL otomatik oluşur; başlık değişikliği URL'yi değiştirmez. Proje/platform/teknolojilerde en fazla 12 ilişkili içerik ve kütüphaneden kapak seçilebilir. Bu seçimler taslakla sürümlenir; yalnız yayımlanmış hedefler public detayda görünür.
6. **Medya** ekranında alternatif metin ve telif/yayın izniyle görsel yükleyin. Tarayıcı boyutlandırıp WebP üretir; sunucu imza/boyut/piksel alanı ve 5 MB sınırını doğrular. Yükleme özel kalır. Alt metin ve özel kullanım notunu sonradan düzenleyebilirsiniz. Public kullanım için yayıncı ayrıca izin vermelidir; özel medya referanslı sayfa veya kayıt yayımlanamaz. İzni geri çekerken bağlı yayınları da taslağa almayı onaylayın. İşlem dosyayı veya taslağı silmez; yeniden yayın için görseli değiştirin veya tekrar izin verip içeriği onaylayın. Daha önce indirilmiş kopyalar geri çağrılamaz. Yeni indirmeler no-store ve güncel RLS ile korunur.

Geliştirme sürümüdür. CMS_ENABLED ve CMS_PUBLIC_READS kapalıyken yayın işlemi mevcut canlı siteyi değiştirmez. Kabul sonrası etkinleştirildiğinde yeni kayıtlar ilgili listeye ve /icerik/... detayına yansır; yalnız ilgili cache etiketi yenilenir. Yerel 15 Auth/Mailpit kontrolü hosted kullanıcı, Resend teslimi ve Cloudflare kabulünün yerine geçmez.

## Yerel Auth testinin tekrarı

Docker olan izole makinede CI'daki pinned Supabase CLI 3.1.0 komutlarını kullanın. Başlangıç/status çıktıları anahtar içerebilir; terminal/log/artifact'a basmayın. Status JSON private geçici dosyada tutulur. `prepare-local-auth.mjs` şablon endpoint'lerini doğrular ve yalnız local Auth'un fallback cache'ini temizler; ardından `npm run cms:test:auth` çalışır. Artifact sadece sansürlenmiş sonuçtur. Gerçek şirket e-postası veya hosted proje fixture olarak kullanılmaz.

## Yedekleme / kesinti / geri dönüş

- Değişiklik öncesi veritabanı dump'ı ve dosyaları ayrı, erişimi korunan konumda saklayın; Free planda günlük otomatik backup varsaymayın. Role/Auth bilgilerini açık Git'e veya genel rapora koymayın. Staging geri yükleme denemesi yapılmadan yedekleme kabulü vermeyin.
- Pause/kota aşımında yönetim kapalı hata vermeli; public statik kaynak çalışmaya devam eder. Sunucu sorgu hatasında statik fallback vardır; Workers üzerinde stale snapshot/rollback ayrıca test edilmelidir.
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

## Güncel kurulum kapısı

Lifecycle migration hosted uygulandı ve doğrulandı. Auth/SMTP/hosting kabulünden önce admin/public anahtarlarını açmayın. [ACCESS_STEPS.md](ACCESS_STEPS.md) kesin adımlardır. SQL dosyası otomatik tekrar çalıştırılmaz; önce history/isim/içerik karşılaştırılır.
