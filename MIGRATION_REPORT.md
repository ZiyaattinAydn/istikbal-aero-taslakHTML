# İstikbal Aerospace — Son QA ve stabilizasyon raporu

**Tarih:** 9 Kasım 2026 (Türkiye)
**Branch:** `feat/nextjs-react-typescript` · **PR:** [#1](https://github.com/ZiyaattinAydn/istikbal-aero-taslakHTML/pull/1)
**HTML referansı / korunan main:** `dc00abb5ae2cfed316a9ad6efe64aa66f6ad16ee`
**Denetim başlangıcı:** `0e548e2` · **Doğrulanan uygulama kodu:** `d49e6180b7826497d43e5ce9070553030d363f9e`

## Merge değerlendirmesi

**Kod incelemesine hazır; otomatik doğrulamalar başarılı.** Next.js migrasyonu yeniden yazılmadı. Son uygulama kodunda 26 içerik/birim testi ve hem development hem production sunucusunda **68/68 Chromium testi** geçti; tekrar denemeyle geçen/flaky test bulunmadı. Kanıt: [tamamlanan CI turu](https://github.com/ZiyaattinAydn/istikbal-aero-taslakHTML/actions/runs/42604281757).

Merge için öneri **koşullu olumlu**: otomatik akışlarda açık bir uygulama engeli kalmadı. Gerçek %100/%125/%150/%200 tarayıcı zoom'u, fiziksel fare/touchpad, Safari/Firefox ve ekran okuyucu kabulü tamamlanmadı. Bu alanlarda başarı iddiası yoktur. Özellikle tek-scroll hissi için fiziksel giriş ve gerçek zoom kontrolü merge kararından önce yapılmalıdır. Merge veya yayın gerçekleştirilmedi.

## Kanıtlanan hatalar ve düzeltmeler

| Hata / tekrar üretme | Düzeltme | Doğrulama |
| --- | --- | --- |
| Development önizlemesinde SSR görünürken React etkileşimleri çalışmıyordu; Next sunucusu `terminal.local` origin'li `/_next/hmr` isteğini engelliyordu. | `allowedDevOrigins` yalnızca bu yerel önizleme hostunu içerir; wildcard eklenmedi. Production erişim/yayın yapılandırması değiştirilmedi. | Gerçek Chrome'da menü ve filtre çalıştı; Fast Refresh sırasında geçici metin değişikliği geldi ve seçili boş filtre durumu korundu. Geçici metin geri alındı. CI development testleri de başarılı. |
| Client route geçişinde Next.js eksik `data-scroll-behavior` uyarısı veriyordu; HTML'de smooth scroll kullanılıyordu. | Root HTML'e `data-scroll-behavior="smooth"` eklendi; Next route scroll resetini doğru ele alır. | 42 route'un tarayıcı kontrollerinde uygulama console error/warning yok; client navigasyonunda aynı document korundu. |
| 1440 × 600 görünümünde hero etiketi header arkasına taşıyordu; 1920 × 600'de ana başlık da kesiliyordu. Kaynak HTML'de de mevcut. | Yalnızca 700 px ve altı yüksekliklerde hero başlığı yüksekliğe göre sınırlandı; dikey boşluklar ve CTA padding'i azaltıldı. | Altı genişlik × iki yükseklik kontrolünde metin/bağlantı sınırları ve header örtüşmesi; masaüstü ve dar ekran karşılaştırmaları. |
| Reduced motion açıkken sticky sahne kaldırılıyor fakat ana sayfanın header örtüşmesi için yer ayrılmıyordu. | Statik hero 100svh; sahne header yüksekliği kadar aşağıda ve kalan viewport yüksekliğinde. | Her genişlikte 600/900 px reduced-motion sınır kontrolü; 390/768 px dokunmatik emülasyonu. |
| Sayfanın tepesinde ve geri dönüşte crossfade 0 yerine yaklaşık 0.0409'da kalıyordu. Negatif başlangıç konumu header yüksekliğini scroll ilerlemesi gibi sayıyordu. Kaynak motion.js'de de mevcut. | Başlangıç konumu 0'a sabitlendi; gerçek kullanılabilir sticky pin mesafesinden ilk header inset'i çıkarıldı. | İlk sahnede ve ters wheel sonrası ilerleme 0; son sahnede 1; pin sona ermeden crossfade tamamlanır. |

Önceden düzeltilen haber filtresi tekrar doğrulandı: Duyurular → **0 kart + boş durum**, Paylaşımlar/Tümü → **2 görünür kart**. Eşleşmeyen kartların render edilmemesi korunur; CSS'in `hidden` üzerine yazması geri getirilmedi.

## Korunan mimari ve kapsam

- Next.js 16.4.5, React/React DOM 19.3.1, strict TypeScript; App Router, ortak React bileşenleri ve typed içerik modelleri korunur.
- 21 içerik sayfası, 21 temiz karşılık, `/`, kayıt tabanlı haber ID seçimi, özel 404 ve noindex/nofollow korunur.
- Orijinal kök HTML/CSS/JS ve görseller değiştirilmedi. `public/assets` kaynak görsellerle byte düzeyinde eşleşir; 21 sayfanın ana içerik/header/footer metinleri kaynak render ile eşleşir.
- Yeni şirket bilgisi, ürün iddiası veya haber eklenmedi. Form backend'i, Supabase, auth ve yönetim paneli eklenmedi.
- GitHub Pages, DNS, ücretli servisler ve production deployment değiştirilmedi. Main'e commit veya merge yapılmadı.

## Taşınan sayfalar

| Eski adres | İçerik |
| --- | --- |
| `index.html` | Ana Sayfa |
| `platformlar.html` | Platformlar |
| `platform-detay.html` | Platform Detayı |
| `iha-sistemleri.html` | İnsansız Hava Sistemleri |
| `ucus-mimarileri.html` | Gömülü Uçuş Mimarileri |
| `hava-savunma-aglari.html` | Hava Savunma Ağları |
| `teknolojiler.html` | Teknolojiler |
| `kabiliyetler.html` | Kabiliyetler |
| `tengri-ai.html` | Tengri AI |
| `otonom-sistemler.html` | Otonom Sistemler |
| `gomulu-sistemler.html` | Gömülü Sistemler |
| `sensor-fuzyonu.html` | Sensör Füzyonu |
| `roket-sistemleri.html` | Roket Sistemleri |
| `ileri-haberlesme.html` | İleri Haberleşme |
| `projeler.html` | Projeler & AR-GE |
| `proje-detay.html` | Proje Detayı |
| `haberler.html` | Haberler & Duyurular |
| `haber-detay.html` | Kayıt tabanlı Haber Detayı |
| `ucus-kontrol-paylasimi.html` | Uçuş Kontrolcüsü, eski özel haber adresi |
| `kurumsal.html` | Kurumsal |
| `iletisim.html` | İletişim |

Ayrıca App Router özel 404 görünümü ve ana sayfaya dönüş bağlantısı taşındı.

## Gerçek test sonuçları

| Kontrol | Sonuç |
| --- | --- |
| `npm ci` | Yerel ortam ve GitHub Actions'ta başarılı |
| `npm run typecheck` | Başarılı; browser testleri ve Playwright config de tip kontrolünde |
| `npm run lint` | Başarılı |
| `npm test` | 26/26 başarılı |
| `npm run build` | Başarılı; genel sayfalar prerender, query kullanan haber detayları dinamik |
| `npm run test:legacy` | Başarılı; 21 eski renderer, linkler, metadata, query güvenliği ve wheel guard |
| `npm run test:browser` — production | **68/68 başarılı**, 1.4 dakika, retry/flaky yok |
| `TEST_SERVER_MODE=dev npm run test:browser` | **68/68 başarılı**, 1.7 dakika, retry/flaky yok |
| Gerçek Chrome / yerel önizleme | Development hydration, HMR, client route, haber filtresi, bölüm navigasyonu ve eski/yeni ekran görüntüleri incelendi |

İlk CI turlarındaki başarısızlıklar saklanmıştır; nihai sonuç olarak sayılmamıştır. Test hedefi hataları (iç intro div'ini bölüm başlangıcı sanma ve sentetik wheel'i Element yerine Window'a gönderme) düzeltildi. Testlerin daha sonra ortaya çıkardığı hero/reduced-motion/crossfade hataları uygulamada düzeltildi; başarısız beklentiler gevşetilmedi.

### Fonksiyonel ve erişilebilirlik kapsamı

- 21 eski URL ve 21 temiz URL: HTTP 200, bir H1, bir header, noindex, React hydration için gerçek menü tıklaması; uygulama console hatası/uyarısı ve başarısız yerel kaynak yanıtları kontrol edilir.
- Haber filtresi, boş durumdan dönüş, varsayılan/boş/tekrarlı/olmayan/kötü amaçlı ID, 404 ve ana sayfaya dönüş testlidir. Olmayan yayın ID'si kaynak davranışı gereği içerik içi bulunamadı gösterir; bilinmeyen URL HTTP 404 döner.
- Klavyeyle mega menü açma, ilk link odağı, Escape ile tetikleyiciye dönüş, kapalı panellerin inert durumu, mobil alt menüler, client route ve logo dönüşü testlidir.
- Form: eksik ad ve geçersiz e-posta engellenir; geçerli alanlarda yerel durum mesajı/reset görülür ve **POST yapılmaz**. EN'nin pasifliği korunur.
- Ekran okuyucu testi yapılmadı; otomatik klavye kontrolleri tam WCAG/ekran okuyucu onayı değildir.

### Motion ve scroll karşılaştırması

`motion.js` ile `src/lib/cinematic.ts` karşılaştırıldı. Wheel/touchpad sezgisi, modifier/horizontal/native-scroll/menu guard'ları, hero için 2050 ms hareket, bölüm geçişlerinin süre/easing'i ve bir kez reveal yaklaşımı korunur. Yukarıdaki başlangıç/pin geometri düzeltmesi dışında animasyon motoru yeniden yazılmadı.

Otomatik Chromium kapsamı: simüle fare wheel adımı, aynı yönde hızlı tekrar, ters yönde hareket sırasında iptal, crossfade 0→1→0, sticky pin bitmeden karışımın tamamlanması, Escape ile iptal, bölüm düğmeleri, geri dönünce kartların görünür kalması, aynı sayfa logo dönüşü ve reduced-motion tercihini açıp kapama. Touchpad benzeri küçük delta/momentum, yatay ve Ctrl girdilerinde browser'a kontrolün bırakıldığı sentetik olaylarla doğrulandı. **Bunlar fiziksel mouse/touchpad deneyimi değildir.**

Route cleanup: ana sayfa → haberler geçişinden sonra wheel engellenmez ve `home-no-scrollbar` kaldırılır; ana sayfaya dönünce wheel handler yeniden çalışır. EventScope dispose testi korunur. Listener/observer/RAF temizliği kod incelemesiyle de kontrol edildi; heap profiler ile uzun süreli bellek sızıntısı ölçümü yapılmadı.

### Responsive kapsamı ve görsel kanıt

Her hücre; ana sayfa, platformlar, teknolojiler, haberler ve iletişim sayfasını içerir. Reduced motion ile bütün metinler görünürken **clipping ancestor sınırları, header'ın hero etiketini örtmesi, grid kart örtüşmesi ve document taşması** kontrol edilir. Yalnızca yatay scrollbar yokluğu yeterli sayılmaz.

| CSS genişliği | 600 px yükseklik | 900 px yükseklik |
| --- | --- | --- |
| 390 | Başarılı | Başarılı |
| 768 | Başarılı | Başarılı |
| 1024 | Başarılı | Başarılı |
| 1280 | Başarılı | Başarılı |
| 1440 | Başarılı | Başarılı |
| 1920 | Başarılı | Başarılı |

Ayrıca platform/teknoloji/haber kartlarının hover sırasında başlık, metin ve link sınırları; 1440 × 600 mega menünün son linkine erişim; 390/768 × 600 dokunmatik emülasyonunda mobil menü ve hero sınırları başarılıdır. Her responsive vaka için tam sayfa görüntüler CI artifact'ında tutulur (7 gün).

Eski HTML ile React sürümü aynı Chrome/origin altında iframe viewport'larında karşılaştırıldı. Masaüstü karşılaştırma görüntülerinde 1440 × 900 iframe'ler yalnızca görsel sunum için %45 ölçeklenir; bu **tarayıcı zoom testi değildir**. Renkler, tipografi, içerikler, kart düzenleri, görseller ve footer tasarım kimliği korundu. Piksel bazında bütün matrisi eşleştiren bir test yapılmadı; düzeltilen hero durumlarında bilinçli geometri farkı vardır.

- [Ana sayfa / masaüstü](docs/qa/home-desktop-comparison.jpg)
- [Ana sayfa / 390 × 600](docs/qa/home-short-comparison.jpg)
- [Platform kartları](docs/qa/platform-desktop-comparison.jpg)
- [Teknoloji kartları](docs/qa/technology-desktop-comparison.jpg)
- [Haber kartları](docs/qa/news-desktop-comparison.jpg)
- [İletişim formu](docs/qa/contact-desktop-comparison.jpg)
- [Footer](docs/qa/footer-desktop-comparison.jpg)

## CI ve tekrar çalıştırma

`.github/workflows/qa.yml` typecheck, lint, 26 test, legacy doğrulama ve build çalıştırır; ardından Chromium testleri development ve production için ayrı işlerde yürür. Deployment yetkisi veya adımı yoktur; workflow token'ı `contents: read` kullanır.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:legacy
npx playwright install chromium
npm run test:browser
TEST_SERVER_MODE=dev npm run test:browser
```

Son satır POSIX shell içindir; PowerShell karşılığı README'dedir. `TEST_BASE_URL` ile mevcut bir yerel sunucu hedeflenebilir. Playwright 1.65.0 geliştirme bağımlılığı olarak eklendi; uygulamaya yeni runtime/animasyon/UI bağımlılığı eklenmedi.

`node scripts/create-browser-fixtures.mjs` geçici `/qa/` referans/karşılaştırma sayfalarını üretir. Production önizlemesinde bunlar sunucu başlamadan oluşturulmalıdır. Geçici dosyalar Git'e alınmaz ve yayın paketinden önce silinmelidir. Kalıcı ekran görüntüleri `docs/qa/` altındadır.

## Kalan riskler ve test sınırları

1. **Gerçek tarayıcı zoom:** %100/%125/%150/%200 seviyeleri doğrulanmadı. Cloud browser'a Ctrl+zoom kısayolu göndermek CSS viewport/DPR'ı değiştirmedi; başarı sayılmadı. CSS viewport veya touch emülasyonu bu testin yerine geçmez.
2. **Fiziksel giriş ve browser çeşitliliği:** Gerçek mouse/touchpad momentum/sezgisi, telefon/tablet, Safari/Firefox ve ekran okuyucu kabulü açık. 200% zoom'da uzun bölümlerin bütün içeriğine fiziksel wheel ve klavye ile erişim özellikle gözden geçirilmeli.
3. **Yönetilen development hostu:** Next dev sunucu tanılarında hosta özgü `uv_resident_set_memory` ENOENT kayıtları gözlendi; uygulama etkileşimlerini engellemedi. Normal GitHub runner'ındaki development kontrolleri geçti. Node/Next bağımlılıklarına veya host güvenlik ayarlarına workaround uygulanmadı. Tarayıcı eklentisinin kendi hataları uygulama hatası olarak sayılmadı.
4. **Bağımlılık bakımı:** GitHub `npm ci` çıktısı 8 moderate dependency advisory bildiriyor; kapsamlı güvenlik/dependency upgrade çalışması yapılmadı ve `npm audit fix --force` çalıştırılmadı. Bu sayı uygulamada doğrulanmış istismar anlamına gelmez. ESLint 9 ve Actions v4 runtime deprecation uyarıları kontrol adımlarını başarısız kılmadı.
5. **İçerik/yayın:** Temsili görseller, şirket yayın onayı ve mevcut prototip sınırları geçerlidir. noindex/nofollow kaldırılmadı. Form mesaj göndermez; EN hazır değildir.

Bu rapor yayına kabul belgesi değildir. PR'ın insan incelemesi ile fiziksel giriş/zoom kabulü kalan teslim adımlarıdır; main veya production üzerinde otomatik işlem yapılmamalıdır.
