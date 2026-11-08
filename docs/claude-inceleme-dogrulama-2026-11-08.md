# İstikbal Aerospace — Claude Kod İncelemesi Karşı Denetim Raporu

**Tarih:** 8 Kasım 2026  
**Kapsam:** `main` dalının, Claude'un incelediğini belirttiği eski `6bfcbe7` commit'inden sonraki güncel sürümü. Bulgular eski kayda göre değil, kontrol sırasında GitHub'dan alınan güncel kaynak üzerinden doğrulandı.

## Logo kararı

Önceki elmas/yıldız sembolü `app.js` içinde elle tanımlanmış bir SVG idi; bunun resmî İstikbal Aerospace logosu olduğuna dair depo kaynağı bulunmuyor. Kullanıcının ilettiği **mavi katman simgesine** benzer yeni inline SVG ve `assets/favicon.svg` eklendi. **Bu simge müşteri tarafından resmî marka olarak henüz onaylanmış sayılmaz.**

## 11 maddenin denetimi

| No | Claude bulgusu | Koddaki durum ve karar | Commit |
|---|---|---|---|
| **1** | `motion.js` tüm sayfalarda wheel'i ele geçiriyor | **Doğrulandı, kapsam daraltıldı.** İç sayfalarda `smoothWheel` tamamen kaldırıldı ve artık bu sayfalara `wheel` engelleyici dinleyici eklenmiyor. **Ana sayfa bölüm adımlaması korundu**, çünkü müşteri özellikle sinematik tek-teker-bir-bölüm deneyimini istedi. Claude'un `delta<48` ve tam sayı olmama ifadesi eski kaynak için geçerli; mevcut kaynakta daha önce bu sezgi değişmişti. Touchpad ayırımı hâlâ kusursuz değil; gerçek cihaz testi gerekir. | `086ba1d` |
| **2** | Haber detayları `PUBLIC_NEWS` verisinden ayrık, kullanıcı id'si güvensiz olabilir | **Doğrulandı, düzeltildi.** Haberlerin ayrıntı alanları ilgili veri kayıtlarına taşındı; `haber-detay.html?id=...` destekleniyor. `haber-detay.html` ve `ucus-kontrol-paylasimi.html` eskisi gibi çalışıyor. Bilinmeyen id boş veya güvenli “bulunamadı” yanıtı verir; id değeri HTML'e geri yazılmaz. Metin kaçışı, yerel dosya adı kısıtlaması ve yalnız HTTPS kaynak kontrolü eklendi. `publishedAt:null` korundu. | `6728daa` |
| **3** | Metinler 9–11 piksel, okunurluk düşük | **Doğrulandı, kısmen düzeltildi.** Form alanı etiketleri, `eyebrow`, `tag`, kart meta ve footer bilgi metinleri 12 piksele yükseltildi. 980–1210px üst menüde yer sıkışması yüzünden 11px korundu, aralıklar ve logo yazısı düzenlendi. Görsel süsleme etiketlerini topluca büyütmek taşmaya neden olabileceği için uygulanmadı. **Gerçek 390/980/1210/1440px tarayıcı ölçümü yapılmadı.** | `2f74af2` |
| **4** | Mobil menü yüksekliği `100vh` ile sınırlanıyor | **Doğrulandı, düzeltildi.** Geriye dönük `100vh` değeri kalıp ikinci `max-height:calc(100dvh - 72px)` tanımı eklendi. | `f02e3b5` |
| **5** | 404 sayfası bağlantısı yalnız repo alt yoluna gidiyor | **Doğrulandı, düzeltildi.** GitHub Pages'te repo kökü; diğer alan adlarında `/` olarak ayarlanıyor. JavaScript kapalıyken GitHub Pages yolu yedek bağlantı olarak kalır. | `9a9a40b` |
| **6** | CSS background görseller erişilebilir değil; kullanılmayan SVG var | **Kısmen doğrulandı, semantik düzeltme yapıldı.** Arka planların çoğu temsili/dekoratif ve metin kartı başlıkları içeriyor. Dekoratif görseller `aria-hidden` oldu. Haber ayrıntısındaki anlamlı illüstrasyonlar artık `img alt="Temsili görsel: …" loading="lazy"` kullanıyor. Tüm arka planlar körlemesine `img` yapılmadı; görsel kompozisyonu korur. `assets/hero-hangar.svg` mevcut JS/CSS dosyalarında referanslanmıyor; silinmedi, ileride medya ayıklaması yapılabilir. | `45d95a4` |
| **7** | İçerik JavaScript ile oluşturuluyor, HTML dosyaları kabuk | **Doğrulandı, ertelendi.** Prototipte `noscript` bilgilendirmesi var; Node/SSG ile 21 sayfa statik üretimi üretim yayınına geçişte ayrı mimari işi. Bu aşamada bütün 21 sayfayı yeniden kurmak istenmeyen tasarım ve link kaybı riskini artırır. | Kod değişikliği yok |
| **8** | Bir menü seçicisinin kaybolması bütün `app.js` başlatmasını bozabilir | **Doğrulandı, düzeltildi.** Menü bağımlılıkları tek yerde kontrol ediliyor. Eksik seçici durumunda menü başlatması atlanıyor, haber filtresi ve form kodu yine çalışıyor. | `907c8b9` |
| **9** | Büyük tek satırlık fonksiyonlar ve veri/kod karışıklığı | **Doğru; kısmen çözülmüş, büyük refaktör ertelendi.** `PUBLIC_WORKS` ve `PUBLIC_NEWS` zaten ayrı veri kayıtları; haber detayları da artık bu veriyi kullanıyor. `capabilities()` / `contact()` dahil tüm gövdeleri ayrı şablon sistemine taşıma, gerçek CMS gereksinimleri belli olduğunda yapılmalı. Mevcut içerikler sırf biçimlendirme için riskli biçimde taşınmadı. | `6728daa` (kısmi) |
| **10** | Kişiye ait e-posta ve telefon kamusal | **Doğrulandı, müşteri onayı bekliyor.** Footer/İletişim'deki mevcut adres ve numara kullanıcının önceki isteğiyle korundu. Şirket/Abdullah'ın kamuya açık kullanım izni alınmalı. Onaysız alternatif genel adres veya numara uydurulmadı. Bu yayın ve veri koruma kontrolüdür. | Kod değişikliği yok |
| **11** | Favicon/OG/canonical/lisans eksik, eski OKU_BENI yanlış | **Kısmen düzeltildi.** SVG favicon, 21 HTML için OG başlık/açıklaması, güncel `OKU_BENI.txt` ve README notları eklendi. Gerçek alan adı belirlenmeden `canonical`/`og:url`, resmî görsel olmadan `og:image`, sahiplik/dağıtım hakkı açıklığa kavuşmadan `LICENSE` eklenmedi. | `702c3a5`, `93adf48`, `7d5c551`, `912c8c2`, `a841a4d`, `4827b4e` |

**Ayrı logo commit'i:** `c86433c`.

## Testler

- Son uygulama kaynakları V8 JavaScript söz dizimi denetiminden geçirildi: `app.js` ve `motion.js` parse ediliyor.
- 21 içerik rotası veri ve DOM temsili üzerinde üretilerek kontrol edildi: **21/21 dolu**, `h1` mevcut, `div` dengesi ve statik yerel bağlantı yolları başarılı.
- `haber-detay.html?id=%22%3E%3Cimg...onerror...` benzeri XSS kimliği hiçbir HTML/onerror içeriği üretmedi; bilinmeyen kimlikler “İçerik bulunamadı” gösterdi.
- Fare ortamı benzetiminde **ana sayfa 1 adet wheel dinleyicisi**, iç sayfalar **0 adet** kaydediyor.
- `package.json` ve `scripts/verify-static.mjs` dosyaları eklendi. **Gerçek depoda Node çalıştırıldığında** `npm test` hem `node --check app.js`, `node --check motion.js` hem de 21 sayfalı smoke testini çalıştırır.

### Doğrulama sınırları

- Bu çalışma ortamında GitHub bağlantısına doğrudan terminal ağ erişimi bulunmadığından, **yerel checkout üzerinde `npm test` fiilen çalıştırılamadı**. Bunun yerine güncel kaynak GitHub bağlantısından okunup V8 ile sözdizimi, sayfa render'ı ve davranış kontrolleri yapıldı.
- **390px mobil / 980–1440px masaüstü yatay taşma, iOS Safari, Android Chrome, zoom, ekran okuyucu ve Lighthouse testleri henüz gerçek tarayıcıda doğrulanmadı.** Kod/medya sorgusu incelemesi, bu cihaz testlerinin yerini tutmaz.
- Form yalnızca örnek; mesaj iletmiyor. Müşteri onaylı teknik bilgiler ve görseller bekliyor.

## Korunan koşullar

- `noindex,nofollow` tüm içerik sayfalarında korunur.
- Temsilî medya/ürün uyarıları ve doğrulanmamış performans beyanlarını yayımlamama ilkesi korunur.
- Bilinmeyen yayın tarihi alanları `publishedAt:null` kalır.
- Eski 21 HTML dosyası ve mevcut haber adresleri korunur.
- Ana sayfanın sahne geçişi ve bölüm navigasyonu kullanıcının özellikle istediği haliyle kalır.

## Yerel test komutu

```powershell
npm test
```

Test hata verirse commit ve hatayı yeniden inceleyin; çıktı alınmadan bütün sorunlar giderildi veya üretim yayını hazır denmemelidir.
