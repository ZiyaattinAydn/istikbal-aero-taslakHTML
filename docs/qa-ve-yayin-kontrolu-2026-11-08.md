# Aşama 6/6 — Teknik QA ve yayın kontrolü
Tarih: 8 Kasım 2026

## Kaynak düzeyinde doğrulananlar
- GitHub `main` dalında 21 içerik HTML dosyası, CSS/JS dosyaları ve `assets/` içinde 8 görsel bulunmaktadır.
- Sayfa bağlantılarının hedefleri repo ağacıyla karşılaştırıldı; kontrol edilen yerel `.html` bağlantılarında eksik hedef bulunmadı.
- Hero görselleri WebP'dir (1600×900, dosya başına yaklaşık 35 KB); yerel görseller düşük dosya boyutuna sahiptir.
- JavaScript sözdizimi doğrulandı. Ana vitrin, scroll modülleri ve mevcut CSS mimarisi korunmuştur.
- Sayfa başlıkları ve meta açıklamaları özelleştirildi; ana sayfa hero görseli ön yüklemeye alındı.
- JavaScript kapalıysa açıklama gösterilir; özel 404 sayfası eklendi.
- `noindex,nofollow` ayarı korunmuştur. Form yalnızca tarayıcıda doğrulama yapar; gerçek mesaj göndermez.
- GitHub API'de Pages özelliği etkin görünmektedir (`has_pages:true`).

## Canlı / cihaz üzerinde henüz doğrulanamayanlar
- Site adresleri bu ortamın web araçlarıyla açılamadı; canlı yayının son durumuna ilişkin HTTP kontrolü yapılamadı.
- Yerel Chromium otomasyonu hem `file://` hem de `localhost` üzerinde ortam politikası nedeniyle engellendi. **Bu yüzden mobil taşma, menüler, Safari ve animasyon testleri başarıyla tamamlandı denemez.**
- Lighthouse performansı, klavye/ekran okuyucu etkileşimi ve telefon/tablet ekran testleri henüz gerçekleştirilmedi.
- `istikbalaerospace.com` ve orijinal `tengri.html` için tam arşiv erişimi olmadığından, eski sitedeki her bilgi birebir doğrulanamadı.

## Üretim yayını için açık işler
1. Resmî logo, kurumsal renkler, gerçek görseller, yayın kullanım izinleri.
2. Mevcut resmî sitenin tam kaynak/yedek içeriğiyle birebir eşleştirme.
3. Platform, proje ve teknik iddiaların statüsü (konsept/prototip/test/aktif) ve müşterinin yazılı onayı.
4. Haber kaynağı URL ve tarihlerinin doğrulanması.
5. Gerçek iletişim formu gerekecekse güvenli sunucu altyapısı, KVKK metni ve spam koruması.
6. 360–430px mobil, 768px tablet, 1366/1920px masaüstü, Safari/Chrome, azaltılmış hareket ve klavye testleri.
7. Alan adı/HTTPS, favicon, arama motoru indekslemesi, sosyal medya metadata ve gizlilik metinlerinin son kontrolü.

**Karar:** Teknik prototip için kaynak düzeyi QA tamam. Resmî müşteri onayı ve gerçek cihaz testleri olmadan üretim yayını tamamlandı denmemeli.

## Ek kontrol — Navigasyon ve tekrarlayan CTA temizliği (8 Kasım 2026)

- 21 içerik sayfası statik kaynaklardan üretilerek ayrı ayrı kontrol edildi.
- Hiçbir içerik sayfasında kırık yerel HTML bağlantısı bulunmadı; `h1`, `section` ve `div` yapıları sayısal olarak dengeli çıktı.
- İletişime giden içerik butonları yalnızca ana sayfada **1** adet. Başka içerik sayfasında iletişim çağrısı yok.
- Toplam **6 adet** `btn` sınıfı kullanan ana içerik kontrolü bulundu: ana sayfada 4, Platformlar'da 1 ve İletişim formunda 1. Kategori/haber kartları bağımsız ve anlamlı detay bağlantıları olarak korunur.
- Tekrarlanan footer iletişim bandı ve gereksiz genel yönlendirme panelleri kaldırıldı. Footer artık kurumsal kimlik ve konum ile sınırlı.
- `PUBLIC_WORKS` ve `PUBLIC_NEWS` listeleriyle proje tanıtımı ve haber kaydı ayrı modelde tutuluyor. Mevcut iki tanıtım korundu. Haber tarihi bilinmiyorsa `publishedAt:null` olarak bırakıldı.
- Değişiklik öncesi 21 sayfanın metinleriyle karşılaştırmada kaldırılan uzun metinlerin çoğu tekrar eden navigasyon ve yönlendirme cümleleriydi; teknik içerik başlıkları ve proje özetleri korundu. **Birebir kelime eşitliği değil, anlam ve içerik kapsamı hedeflendi.**
- Sonuç: Kaynak düzeyinde doğrulama başarılı. **Gerçek mobil/Safari/Chrome, görsel düzen ve animasyon testleri hâlâ yapılmadı.**
