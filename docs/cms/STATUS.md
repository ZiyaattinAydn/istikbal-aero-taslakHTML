# CMS durumu — 11 Kasım 2026 devam çalışması

**PR #13 / feat/cms-foundation. Üretim yayını yok; Cloudflare hosting kabulü hâlâ NO-GO.**

Kullanıcı yeni bağımsız Supabase Free projesini, başlangıç yayıncı e-postasını ve DNS'siz geliştirmeyi onayladı. Seçilen organizasyon Ziyaattin.Dev; fiyat 0 USD/ay olarak doğrulandı. `istikbal-aerospace-cms` / `uftnykormtwlzolwbhfb` oluşturuldu. Mevcut müşterilerin veritabanları değiştirilmedi. DNS, MX, nameserver, ücretli servis, ödeme ve main merge yok.

| Faz | Durum | Gerçek sonuç / kalan kabul |
|---|---|---|
| 0 | Tamamlandı | Önceki PR ve tree doğrulandı; mevcut branch sürdürüldü. Yeni proje ve dış erişim sınırları belirlendi. |
| 1 | Kısmi / hosting NO-GO | Önceki vinext build geçerli. Cloudflare hesabı Work'te bağlı değil, tarayıcı oturumu yok; staging CPU/cache kanıtı bekliyor. Yerel HTTP ve CI browser kıyası hazırlanıyor. |
| 2 | Şema ve içerik aktarımı tamamlandı | 21 sayfa / 537 kontrollü alan şeması, yeni bağımsız DB'ye migration + idempotent taslak seed uygulandı. Storage özel bucket, RLS, onay/sürüm/audit korundu. |
| 3 | Kısmi | OTP/TOTP, kapalı local signup ve DB account guard; kullanıcı e-postası özel allowlist'te. Hosted Auth kullanıcısı/Admin API ayarları ve gerçek MFA kurulumu bekliyor. CLI/Mailpit gerçek entegrasyon testi CI'da; Resend DNS teslimi yapılmadı. |
| 4 | Kod tamamlandı; uçtan uca kabul bekliyor | 21 sayfanın alan düzenleyicisi, dolu içerik, SEO, gerçek React şablon önizlemesi, sürüm/geri alma ve hedefli cache invalidation eklendi. Auth ve staging'de kullanıcı kabulü bekliyor. |
| 5 | Kısmi | Kayıt CRUD + public liste/detay yolları; özel medya yükleme/seçme, istemcide WebP boyutlandırma, sunucuda imza/dimension/izin doğrulaması, yayıncı medya onayı. İlişki düzenleyicisi ve detaylarda ilişkili içerik gösterimi henüz yok. |
| 6 | Devam ediyor | 53 yerel test, typecheck/lint/build ve audit geçti; son CI browser, local Auth/Mailpit ve performans sonuçları takip ediliyor. Fiziksel cihaz ve gerçek sağlayıcı kabulü bekliyor. |

## Çalışan kod ile etkin servis ayrımı

- `CMS_ENABLED=false`, `CMS_PUBLIC_READS=false` varsayılanları korunur. Yeni kod canlı yayına açılmadı. Hosting GO olmadan public veri geçişi etkinleştirilmez.
- Düzenleme şablonu `PageContent` ile aynıdır; raw HTML/page builder yok. 21 sayfanın mevcut metinleri/linkleri/medya referansları eski kaynakla karşılaştırılır.
- Yayın yalnız `cms_published` snapshot'ını değiştirir; taslaklar public sorguya girmez. Public sorgular seçici, etiketli ve 300 saniye cache'lidir. Yayın/arşiv işlemi yalnız ilgili sayfa/listenin cache'ini düşürür. Workers üzerindeki gerçek cache davranışı hâlâ test gerektirir.
- Medya private bucket'ta kalır. Public kullanım için ayrıca yayıncı onayı gerekir; onaysız medya referansı olan sayfa yayınlanamaz. Private önizleme dosyaları yalnız admin/MFA ile açılır.
- Sayfa alan kimlikleri kod içinde sabittir; kullanıcıya UUID/slug/JSON gösterilmez. Bazı paylaşılan kartların sayfa bazında farklı metinleri vardır; tam global içerik tekilleştirmesi sonraki içerik revizyonunda değerlendirilmeli.

## Dış bağımlılıklar

[SMTP_AND_ACCESS.md](SMTP_AND_ACCESS.md) gerçek erişim ve SMTP durumunun ayrıntısıdır. Kullanıcı e-postası allowlist'e eklenmiştir; **hosted giriş hesabı provision edildi veya gerçek OTP teslim edildi denmez**. Supabase Admin API/Dashboard oturumu, Cloudflare staging ve Resend entegrasyonu erişimi gereklidir. Gerçek domain gönderici doğrulaması en son aşamadadır.

## Kanıt ve komutlar

- `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit`.
- `npm run cms:inventory:check`, `cms:snapshots:check`, `cms:seed:check`, `cms:pages:check`.
- CI `cms-local-auth`: Supabase CLI 3.1.0 + Mailpit gerçek Auth/MFA/API/Storage; sadece sansürlenmiş sonuç artifact'ı.
- CI `cms-performance`: aynı runner'da PR base ve yeni production build, masaüstü/mobil Chromium ölçümleri. CMS kapalı senaryodur; hosted DB/Workers/field INP ölçümü değildir.
- Hosted DB'de anonim taslak erişimi reddi, 21 taslak/537 alan/özel bucket/allowlist ve security advisors sorguları doğrulandı. Security advisors temiz; yeni projede kullanılmamış indeks bilgileri beklenir.

Önceki kabul edilmiş kod: `4e61a7c` için development ve production 71/71 tarayıcı testi, checks ve CodeQL başarılıydı. Devam çalışmasının yeni CI sonuçları PR #13'te izlenir. [PR #13](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/13).

## Tarayıcı kanıtı — b38758f

[CI 43063031195](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43063031195): checks ve production Chromium başarılı; performance işi tamamlandı. `browser-before/after/comparison.json` artifact’ları repo kanıtlarına alındı. Local Auth işi e-posta okuyucusunda başarısız oldu; kodu veya gövdeyi loglamadan test okuyucusu düzeltiliyor. Bu başarısızlık OTP teslim kabulü değildir. Sonraki değişiklik yeni kayıtlar için de aynı şablonda korumalı taslak önizleme ekler; yerelde 53 test/typecheck/lint/build geçti.
