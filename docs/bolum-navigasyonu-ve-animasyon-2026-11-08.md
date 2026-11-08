# İstikbal Aerospace — Bölüm Navigasyonu, Animasyon ve Footer Güncellemesi

Tarih: 08.11.2026  
Kapsam: TUSAŞ ekran görüntülerinden *etkileşim fikri* alınarak oluşturulan özgün bölüm navigasyonu, tek seferlik metin animasyonları ve iletişim bilgileri içeren footer.

## 1. Ana sayfa bölüm navigasyonu

Sağ kenardaki sabit, noktalı gezinti ana sayfada **8 ana bölümü** işaretler:

1. Giriş
2. Mühendislik
3. Platformlar
4. Teknolojiler
5. Tengri AI
6. Projeler & AR-GE
7. Haberler
8. Kurumsal

- Noktaların üstüne gelindiğinde veya klavyeyle odaklanıldığında bölüm adı görünür.
- Etkin bölüm, vurgulu nokta ve bölüm etiketiyle belirtilir.
- Noktaya tıklanınca yeni sayfa açılmaz; var olan scroll sistemi üzerinden hedef bölüme yumuşak geçiş yapılır.
- Son bölümden ilk bölüme doğrudan dönülebilir; aradaki bölümlerin her birinde ayrı teker hareketi gerekmiyor.
- Küçük ekranlarda sabit noktalar yerine **Bölümler** açılır kontrolü bulunur. Seçimden sonra kontrol kapanır.
- `prefers-reduced-motion` tercihinde zorlanmış yumuşak geçiş kullanılmaz.
- Bu gezinti **yalnızca uzun ana sayfada** görünür; kısa iç sayfalarda gereksiz tekrar yaratmaz.

## 2. Geri yukarı kaydırırken metin animasyonları

`motion.js` içindeki `IntersectionObserver` artık bir metin/görsel aktörünü ilk kez görünür kıldığında tekrar gizlemez. İlk görünüş animasyonu korunur; ziyaret edilen içerik geri kaydırıldığında hemen ve kalıcı olarak görünür. Aktörler gözlemden çıkarılır. Sayfa yeniden boyutlandırılması, yukarıdan aşağıya veya aşağıdan yukarıya dönüş ve tarayıcının derin scroll konumundan açılması dikkate alındı.

**Not:** Hero uçuş–hangar görsel geçişi ve tekerle adımlı bölüm scroll'u değiştirilmedi. Scroll sırasında hero içeriğinin orijinal görsel geçiş davranışı korunur.

## 3. Footer

Önceki aşamada fazla sadeleştirilen footer'da şunlar geri getirildi:
- Şirketin mevcut genel tanıtım açıklaması
- Kepez, Antalya / Türkiye konumu
- Mevcut iletişim sayfasındaki e-posta ve telefon
- © 2026 İstikbal Aerospace ve faaliyet etiketleri

Sırf sayfa yönlendirmesi amacı taşıyan Çözümler/Keşfet menü sütunları ve tüm sayfalarda yinelenen büyük iletişim çağrısı geri getirilmedi. E-posta ve telefon doğrudan ilgili uygulamayı açan `mailto:` / `tel:` bağlantıları olarak korundu.

**Kaynak sınırı:** Footer bilgileri projede daha önce zaten bulunan metin ve iletişim kayıtlarıdır; resmî eski sitenin eksiksiz kopyalandığı iddia edilmez.

## 4. Testler

- 21 HTML içerik rotası programatik olarak oluşturulup yerel `.html` bağlantıları, başlık/DOM kapsayıcı dengesi ve footer bilgileri kontrol edildi: hata bulunmadı.
- Ana sayfada 8 bölüm / 8 nokta eşleştirildi. İç sayfalarda bu kontrol görünmüyor.
- `app.js` ve `motion.js` sözdizimi kontrolü geçti.
- Sahte DOM/scroll ortamında 10 davranış testi geçti: ilk animasyon, tekrar gizlenmeme, yeniden boyutlandırma, son bölüme geçiş, en üste dönüş, etkin durum ve mobil açılır menü.
- **Henüz gerçek mobil cihaz / Safari / Chrome üzerinde görsel ve performans testi yapılmadı.** Bu programatik kontrollerin yerine geçmez.

## 5. Değiştirilen dosyalar

- `app.js`: Navigasyon işaretleri ve footer.
- `motion.js`: Bölüm atlama/aktif izleme, yalnızca ilk görünüşte içerik açma.
- `refinement.css`: Nokta/hover etiketi, mobil açılır kontrol, iletişimli footer yerleşimi.

Mevcut proje, haber, teknoloji, kurumsal ve ana sayfa metinleri ile ürün kartları değiştirilmedi.
