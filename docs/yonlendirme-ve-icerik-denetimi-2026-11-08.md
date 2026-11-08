# İstikbal Aerospace — Yönlendirme ve İçerik Denetimi

**Tarih:** 08.11.2026  
**Kapsam:** İletişim çağrıları, gereksiz sayfa geçişleri, içerik korunumu ve statik veri düzeni.

## 1. Yönlendirme ilkesi

Bir bağlantı ancak ziyaretçiye yeni ve ilgili bilgi sunuyorsa yerinde tutulur. Ürün/teknoloji/haber kartının kendi detayını açması anlamlıdır. Aynı sayfada zaten var olan karta ek olarak "Tüm Teknolojiler", "Kabiliyetleri Keşfet", "Detayları İncele" gibi genel bir yönlendirme tekrarına gerek yoktur.

## 2. Yapılan değişiklikler

- Her sayfanın altında tekrar eden `contact-cta` alanı kaldırıldı.
- Ana sayfada **bir adet** "İletişime Geç" bağlantısı kaldı; `iletisim.html` ve ana menüdeki normal İletişim bağlantısı korunuyor.
- Footer'ın tekrarlayan sayfa bağlantıları ve İletişim butonu kaldırıldı. Yerine firma kimliği ve konum bilgisi bırakıldı; telefon/e-posta **İletişim sayfasında** duruyor.
- Ana sayfanın başlık/özellik panellerinde aynı hedefe yönlendiren yinelenen butonlar çıkarıldı.
- Platform detayları ve teknoloji detaylarının sonundaki genel "diğer sayfaya git" panellerinin ilişkili mühendislik cümleleri kendi içeriklerine alındı.
- Haberler'deki tekrar Tengri AI tanıtım paneli ve Projeler'deki tekrar Gömülü Sistemler paneli kaldırıldı.
- Kurumsal'ın Sistem Tasarımı, Hızlı Prototipleme, Entegrasyon kartları artık başka sayfalara gitmek yerine **salt bilgi kartı**.
- Haber kaynak bağlantıları, projelerin kendi tanıtımlarına ve teknoloji kartlarının teknik detaylarına giden anlamlı bağlantılar korundu.

## 3. Veri organizasyonu

`app.js` içinde iki ayrı veri listesi vardır:
- `PUBLIC_WORKS`: Kamuya açık tanıtımı olan çalışmalar (şu anda Tengri AI ve yeni nesil uçuş kontrolcüsü).
- `PUBLIC_NEWS`: Bunlarla ilişkili kamuya açık tanıtım/paylaşım kayıtları.

Listeler `projects()` ve `news()` içindeki kartları oluşturur. Yayın tarihi doğrulanmamışsa `publishedAt:null` tutulur. **Bu bir CMS veya proje yönetim paneli değildir.** Gerçek CRUD için ayrıca veri tabanı, yetkilendirme ve onay sistemi gerekir.

## 4. Kontrol sonucu

21 içerik sayfası JS içerik üreticisinden ayrı ayrı oluşturulup kaynak düzeyinde denetlendi:
- Kırık yerel `.html` bağlantısı: **0**
- İçerik kısmındaki iletişim yönlendirmesi: **Ana sayfada 1, diğer 20 sayfada 0**
- Ortak footer iletişim bandı: **0**
- Ana içerikteki `.btn` sınıfı sayısı: **6** (ana sayfa 4, Platformlar 1, İletişim formunda 1)
- `section` ve `div` açık/kapalı sayısı, `h1` ve JavaScript sözdizimi kontrolleri geçti.

Değişiklik öncesindeki 21 sayfanın metinleri de yeni sürümle kıyaslandı. Kaldırılan uzun cümlelerin önemli bölümü gezinme önerileri veya tekrar eden tanıtımlardı. Teknik kavramlar, proje başlıkları, detay modülleri ve haber kaynakları kaldı; bazı cümleler aynı anlamla yeniden yazıldı. **Kelime kelime birebir metin koruma değil, bilgi kapsamını koruma** hedeflendi.

## 5. Bilerek değiştirilmediklerimiz

- Toplam 21 içerik sayfası + 404 dosyası korundu.
- Platformlar/Teknolojiler alt menü düzeni, ana tasarım, sinematik scroll ve görseller değiştirilmedi.
- Gerçek teknik olgunluk, haber tarihi veya müşteri onaylı kaynak uydurulmadı.
- İletişim formu gerçek gönderim yapmaz; eski ve yeni durum aynıdır.

## 6. Açık testler

Gerçek GitHub Pages yayını, iOS Safari, Android Chrome, tablet, masaüstü ekranlar, Lighthouse, klavye/ekran okuyucu ve animasyon görüntü testi **bu ortamda yapılmadı**. Canlı önizleme URL'si web erişim denemesinde açılamadı. Kaynak düzeyindeki başarı bu testlerin yerini tutmaz.

## 7. Abdullah'ın içerik teslimine hazırlık

Ürün/proje/teknoloji/haber türlerini ve yayımlanabilirlik onaylarını ayrıştıran [içerik giriş şablonu](abdullah-icerik-giris-sablonu.md) hazırlanmıştır. Sayfa sayısı yeni doğrulanmış içeriklerle büyüyebilir; sırf sayfa sayısını artırmak için detay sayfası oluşturulmayacaktır.
