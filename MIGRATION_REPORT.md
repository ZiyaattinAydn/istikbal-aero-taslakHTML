# İstikbal Aerospace — Migrasyon teslim raporu

**Tarih:** 9 Kasım 2026 (Türkiye)

**Branch:** [feat/nextjs-react-typescript](https://github.com/ZiyaattinAydn/istikbal-aero-taslakHTML/tree/feat/nextjs-react-typescript)

**Referans:** `main@dc00abb5ae2cfed316a9ad6efe64aa66f6ad16ee`.

## Tamamlanan işler

- Next.js 16.4.5 App Router, React 19.3.1, strict TypeScript ve ESLint kurulumu; lockfile ile sabit sürümler.
- 21 içerik sayfasının tamamı SSR/SSG uyumlu gerçek React bileşenlerine taşındı. HTML enjeksiyonu veya eski `app.js` çalıştırma katmanı kullanılmaz.
- Header, footer, marka, masaüstü/mobil menü, dil seçici, hero, bölüm navigasyonu, kartlar, iç sayfa şablonları, haber listesi ve iletişim formu ayrıldı.
- Navigasyon, kartlar, kamuya açık çalışmalar/haberler ve teknoloji/platform metinleri TypeScript veri modellerine taşındı.
- Eski `.html` adresleri doğrudan desteklenir; 21 uzantısız karşılık ve `/` de çalışır. Haber detayları kayıt kimliğiyle sunucuda seçilir; query metni HTML veya link olarak kullanılmaz.
- Animasyon motoru route köküne sınırlandı. Listener, media query, observer ve animation frame'ler unmount sırasında temizlenir; geç font promise'leri dispose kontrolü yapar. Resize ile wheel yeniden bağlanırken aynı kayıt tekrar biriktirilmez.
- Fare/touchpad sezgisi, ana sayfa bölüm adımları, uçuş–hangar karışımı, resize/zoom geometrisi, reduced motion ve bir kez görünen kart yaklaşımı korundu. İç sayfalarda doğal kaydırma devam eder.
- Global font CSS'i root layout üzerinden yüklendi. CSS dosyaları birleştirildiğinde kaybolan `@import` kaynaklı görünüm farkı bu şekilde giderildi; build sırasında font indirme bağımlılığı eklenmedi.
- Yerel geliştirme ve production önizleme komutları, içerik regresyonları ve isteğe bağlı tarayıcı karşılaştırma dosyaları eklendi.

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

## Test sonuçları

| Kontrol | Sonuç / kapsam |
| --- | --- |
| `npm run typecheck` | Başarılı, strict TypeScript |
| `npm run lint` | Başarılı, hata ve uyarı yok |
| `npm test` | 26/26 başarılı |
| İçerik karşılaştırması | 21 sayfanın tüm ana içerik, header/footer metinleri kaynak render ile eşleşiyor; birer H1 ve iç link hedefleri doğrulandı |
| Dosya bütünlüğü | 38 orijinal HTML/CSS/JS/görsel dosyasında değişiklik yok; tüm `public/assets` görselleri kaynakla byte düzeyinde aynı |
| Haber güvenliği | İki eski varsayılan, alternatif kimlik, boş/eksik/tekrarlı query, olmayan kimlik ve HTML/script benzeri kötü amaçlı ID testleri başarılı |
| `npm run build` | Başarılı; ana sayfa ve genel sayfalar prerender edilir, query kullanan haber detayları dinamik sunulur |
| `npm run test:legacy` | Başarılı; eski 21 render, link, metadata ve wheel guard kontrolleri korunuyor |
| Gerçek Chrome, production build | 21 eski adres açıldı; her sayfada bir H1, bir header, noindex/nofollow ve sıfır yatay document taşması |
| Tarayıcı akışları | TR açılması / EN pasifliği, klavyeyle mega menü ve ilk link odağı, Next link ile route geçişi, dar görünüm hamburger/alt menü, Escape ile tetikleyiciye odak dönüşü, haber filtresinde boş durum ve geri dönüş başarılı |
| Haber / 404 akışları | Geçersiz kimlik, uçuş kontrolcüsünü ID ile açma, bilinmeyen URL ve 404'ten ana sayfaya dönüş başarılı |
| Form | Geçerli alanlarla yerel kontrol, durum mesajı ve reset başarılı; sunucuya veri gönderilmez |
| Ana sayfa animasyonu | Gerçek scroll girdisinde uçuş–hangar ilerlemesi 1.0000'a ulaştı; bölüm düğmesi doğru bölümü etkinleştirdi ve dört teknoloji kartı görünür oldu |
| Uygulama logları | Production kontrollerinde uygulamaya ait console error/warn gözlenmedi; tarayıcı eklentisinin kendi uyarıları kapsam dışı |

### Responsive karşılaştırma

Eski ve yeni sürüm aynı Chrome oturumunda, aynı origin altında iframe CSS viewport'larında karşılaştırıldı. Bu yöntem gerçek telefon/touch emülasyonu değildir.

| CSS viewport genişliği | Ana sayfa | Teknolojiler | Haberler | İletişim |
| --- | --- | --- | --- | --- |
| 390 px | Taşma yok | Taşma yok | Taşma yok | Taşma yok, tek kolon |
| 768 px | Taşma yok | Taşma yok | Taşma yok | Taşma yok, tek kolon |
| 1024 px | Taşma yok | Taşma yok | Taşma yok | Taşma yok, tek kolon |
| 1280 px | Taşma yok | Taşma yok | Taşma yok | Taşma yok, iki kolon |
| 1440 px | Taşma yok | Taşma yok | Taşma yok | Taşma yok, iki kolon |
| 1920 px | Taşma yok | Taşma yok | Taşma yok | Taşma yok, iki kolon |

Bu dört sayfada eski/yeni bölüm yükseklikleri, kart sayıları ve iletişim kolon ölçüleri eşleşti. 1363 × 936 ana sayfa ve dar iletişim görünümü ekran görüntüleri görsel olarak karşılaştırıldı. Tüm kombinasyonlar için otomatik piksel farkı testi yapılmadı.

## Korunan özellikler ve güvenlik sınırları

Koyu lacivert/elektrik mavisi tema, Barlow Condensed/Manrope, logo/favicon, beş CSS katmanının sırası, responsive düzen, hover stilleri, navigasyon/dil seçici, sinematik ana sayfa, sağ bölüm navigasyonu, orijinal görseller/metinler, footer/iletişim bilgileri ve erişilebilirlik etiketleri korunur. Kapalı menülere `inert` eklendi; gizli bağlantılar klavyeyle odaklanamaz.

`noindex,nofollow`, Open Graph metinleri ve temsili/doğrulanmamış içerik sınırlamaları korunur. `X-Robots-Tag` response header'ı da eklendi. Yeni şirket/ürün/haber veya performans iddiası eklenmedi.

Main commit'i son kontrolde hâlâ `dc00abb5ae2cfed316a9ad6efe64aa66f6ad16ee`. Main'e commit/merge, force push, production yayını, Pages ayarı, DNS veya ücretli servis değişikliği yapılmadı. Terminalde GitHub push kimlik bilgisi olmadığı için aşamalı commit'ler bağlı GitHub entegrasyonuyla branch'e aktarıldı.

## Bilinen sınırlamalar / kalan doğrulama

- Doğrulanan akışlarda açık bir uygulama engeli bulunmadı. EN ve formun mesaj göndermemesi, kaynak prototipin bilinçli sınırlarıdır.
- Gerçek %100/%125/%150/%200 tarayıcı zoom otomasyonu bu oturumda doğrulanamadı. CSS viewport testleri bunun yerine gerçek zoom testi olarak sayılmamıştır.
- Gerçek telefon/tablet, Safari/Firefox, ekran okuyucu ve farklı fiziksel fare/touchpad cihazlarıyla kapsamlı test yapılmadı. Touchpad ayırımı kaynaktaki gibi sezgiseldir.
- Reduced motion kodu ve medya sorguları korunur; sistem tercihi değiştirilerek tarayıcı testi yapılmadı. Kartların geri kaydırmada tekrar gizlenmemesi koddaki tek-sefer reveal mantığıyla korunur; bütün scroll permütasyonları otomatik test edilmedi.
- Bu yönetilen ortamın development önizlemesinde hydration tamamlanmadığından UI kontrolleri başarılı production build'iyle yapıldı. `npm run dev` bu ortamda tarayıcıda uçtan uca doğrulanmış olarak sunulmaz. Normal yerel kullanım için dev komutu korunmuştur.
- Haber ID'si bulunamadığında kaynak davranışı gereği içerik içi bulunamadı görünümü döner; bilinmeyen sayfa URL'si App Router 404'ünü kullanır.
- Supabase, auth, yönetim paneli ve gerçek form gönderimi kapsam dışıdır. Üretim yayınından önce içerik/görsel onayı gereksinimleri devam eder.

## Bağımlılıklar ve çalıştırma

Runtime: **next 16.4.5**, **react / react-dom 19.3.1**. Ek animasyon/UI framework'ü yok.

Geliştirme/test: TypeScript 6.0.3, ESLint 9.39.5, eslint-config-next 16.4.5, tsx 4.23.15, parse5 8.1.1 ve Node/React tip paketleri. `parse5` yalnızca regresyon testlerindedir. Sürümler `package-lock.json` ile sabitlenmiştir.

```sh
npm ci
npm run dev
# veya production build'i yerelde incelemek için:
npm run build
npm start
```

Genel önizleme başlatıcıları için `npm run preview -- --port 4173` kullanılabilir; önce build gerektirir. Regresyon komutları yukarıdaki test tablosundadır.

## Sonraki adımlar

1. Gerçek cihaz, zoom seviyeleri ve ekran okuyucu kontrollerini tamamlayın; müşteriyle görsel kabul yapın.
2. İçerik giriş sözleşmesini `src/data/models.ts` üzerinden netleştirip ayrı görevde Supabase/CMS planlayın.
3. Üretim yayını ayrı onayla planlansın; bu branch otomatik olarak main'e alınmamalıdır.
4. Referans HTML kaynaklarını yalnızca ayrı bir temizlik kararıyla kaldırın; şu an içerik koruma testleri bunları kullanıyor.
