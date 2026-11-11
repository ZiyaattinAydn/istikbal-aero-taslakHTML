# CMS durumu — 11 Kasım 2026 devam çalışması

**PR #13 / feat/cms-foundation. Üretim yayını yok; Cloudflare hosting kabulü NO-GO.**

Kullanıcı yeni bağımsız Supabase Free projesini, başlangıç yayıncı e-postasını ve DNS'siz geliştirmeyi onayladı. Ziyaattin.Dev altında aylık 0 USD fiyat doğrulanarak `istikbal-aerospace-cms` / `uftnykormtwlzolwbhfb` oluşturuldu. Başka projeye migration uygulanmadı. DNS, MX, nameserver, ücretli servis, ödeme ve main merge yok.

| Faz | Durum | Gerçek sonuç / kalan kabul |
|---|---|---|
| 0 | Tamamlandı | Mevcut branch/PR sürdürüldü; yeni proje ve dış erişim sınırları belirlendi. |
| 1 | Kısmi / hosting NO-GO | İzole vinext build ve gerçek Chromium önce/sonra ölçümü var. Cloudflare Work bağlantısı/oturumu yok; staging CPU/cache testi bekliyor. |
| 2 | Şema ve aktarım tamamlandı | Dört migration; 21 sayfa / 537 kontrollü alan; idempotent taslak seed; private Storage, RLS ve advisors doğrulandı. |
| 3 | Yerel entegrasyon geçti; hosted kısmi | Gerçek CLI + Mailpit'te 15 OTP/TOTP/Auth/API/Storage kontrolü geçti. Kullanıcı e-postası özel allowlist'te; hosted kullanıcı provision, Auth ayarları ve gerçek SMTP teslimi bekliyor. |
| 4 | Kod hazır; kullanıcı/staging kabulü bekliyor | 21 sayfa dolu alan düzenleyicisi, SEO, gerçek şablon önizleme, sürüm/geri alma ve hedefli cache invalidation. |
| 5 | Kısmi | Kayıt CRUD, public liste/detay, gerçek kayıt önizlemesi, özel medya yükleme/seçme/public kullanım onayı. İlişki düzenleyicisi, yeni kayıtlara kapak seçici ve medya sonradan düzenleme/izin geri çekme açık. |
| 6 | Testler geçti; dış kabul açık | 53 test, typecheck/lint/build/audit; local Auth 15 kontrol. Son CI'da dev/prod Chromium 71/71, performans ve CodeQL başarılı. Fiziksel cihaz ve gerçek sağlayıcı/kullanıcı kabulü bekliyor. |

## Doğrulanan akış

[CI 43067794522](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43067794522), kod `dfa9266`: checks, `cms-local-auth`, dev/prod 71/71, performans ve CodeQL başarılı. Mailpit gerçekten özel altı haneli OTP şablonunu aldı; yanlış kod/tek kullanım, kapalı signup, TOTP ile AAL2, AAL1 yazma reddi, anonim taslak reddi, onaylı yayın, private/public Storage ve oturum iptali test edildi. [Yerel Auth kanıtı](evidence/local-auth-ci.json). Gerçek Resend/domain teslimi test edilmedi.

Önceki devam CI'sında (`b3aa751`, [43065671226](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43065671226)) dev/prod 71/71, checks, performans ve CodeQL geçti. O turun Mailpit hatası yukarıdaki sonraki turda düzeltildi; ilk başarısızlıklar başarı olarak sayılmadı. Son kod turunun bütün işleri yukarıdaki dfa9266 sürümünde başarılıdır. Sonraki rapor commit'i yalnız belgelerdir.

## Kod ve etkin servis ayrımı

- `CMS_ENABLED=false`, `CMS_PUBLIC_READS=false` varsayılanları korunur. Hosting GO olmadan public veri geçişi etkinleştirilmez.
- Sayfa önizlemesi public `PageContent`, yeni kayıt önizlemesi public `EntryContent` ile aynı şablonu kullanır. Raw HTML/page builder yok.
- Public sorgular yalnız yayın snapshot'ını okur; seçici, etiketli ve 300 saniye cache'lidir. Yayın/arşiv yalnız etkilenen sayfa/liste/item etiketini yeniler. Workers kabulü hâlâ gerekir.
- Medya private bucket'tadır. Public kullanım için yayıncı onayı gerekir; özel medya referanslı sayfa yayınlanamaz.
- Bazı paylaşılan kart metinleri sayfa bazında ayrı alanlardır. Tam global içerik tekilleştirmesi sonraki revizyonda değerlendirilmeli.

## Performans

Gerçek Chromium masaüstü/mobil viewport kıyası [PERFORMANCE.md](PERFORMANCE.md) ve evidence/browser-*.json içinde. Public script artışı +1.343 byte (~%0,72 yerel gzip). Bu CMS_PUBLIC_READS=false laboratuvar senaryosudur; gerçek DB/Workers, mobil CPU, field INP ve save p95 kabulü değildir.

## Açık bağımlılıklar ve sıradaki işler

[SMTP_AND_ACCESS.md](SMTP_AND_ACCESS.md) erişim kaydıdır. Hosted giriş hesabı henüz oluşturulmadı. Supabase Auth Admin/Dashboard erişimi, Cloudflare staging yetkisi ve Resend resmî entegrasyon oturumu gerekir. Gönderici domain doğrulaması DNS aşamasına bırakıldı.

Kod işleri: ilişki editörü ve public ilişki kartları; yeni kayıt kapak seçici; medya düzenleme/izin geri çekme; MFA ile gerçek UI iş akışı ve fiziksel cihaz kabulü. Çalışma ortamı son Auth testi sonrasında kullanılamaz oldu; son kod GitHub'dadır, raporlar GitHub üzerinden güncellenmiştir. Bu işler tamamlanmış gösterilmez.

## Tekrarlama

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit`; `cms:inventory:check`, `cms:snapshots:check`, `cms:seed:check`, `cms:pages:check`. CI `cms-local-auth` izole CLI 3.1.0 + Mailpit çalıştırır; anahtar/OTP/token loglamaz. CI `cms-performance` aynı runner'da PR base ile yeni production build'i ölçer.

[PR #13](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/13) taslaktır; main merge veya canlı yayın yapılmadı.

## Tamamlama turu — 12 Kasım 2026

Branch 8bcc6e7 üzerinden kurtarıldı. İlişki/kapak, public ilişkili içerik, medya metadata ve onaylı yayın geri çekme kodu eklendi. 56 yerel test/typecheck/lint/build ve şema/snapshot kontrolleri başarılı. Gerçek UI CI ilk turunda ikinci sayfada durdu; henüz tam kabul verilmedi, test sınıflaması geliştiriliyor. Yeni migration hosted projeye henüz uygulanmadı. [ACCESS_STEPS.md](ACCESS_STEPS.md) tek erişim kontrolünü ve gereken kesin servis adımlarını içerir.
