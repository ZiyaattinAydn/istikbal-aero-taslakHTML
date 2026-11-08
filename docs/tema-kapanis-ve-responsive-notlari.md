# İstikbal Aerospace — KAAN görsel dili ve responsive son düzenlemeleri

**Kapsam:** Kullanıcının deneme teması için gönderdiği ekran görüntülerinden sonra yapılan dört aşamalı görsel revizyon. Temanın ana dala geçmesi istenmiştir.

## Uygulanan görsel kararlar

1. **Tipografi:** Barlow Condensed başlıklarda korunur. Başlık satır yükseklikleri ve harf boşlukları artırıldı; 21 sayfa için ortak başlık ölçeği, intro, teknoloji/ürün/haber kartları ve kurumsal/iletişim düzenleri güçlendirildi.
2. **Header:** Ana sayfada hero görselinin üzerine binen saydam başlık, hover ve odakta koyu lacivert arka plan, daha ölçülü aktif menü çizgisi. Yedi ana menü başlığı aynı boyutta tutuldu ve aralıkları artırıldı. Dar masaüstünde taşmayı önlemek için 1160px altında mobil menüye geçilir.
3. **Dil seçimi:** Sağda çalışan TR açılır menüsü var. `EN · English` seçenek olarak görünür ancak henüz çeviri olmadığı için pasiftir. Mevcut dil asla sahte biçimde İngilizceye alınmaz.
4. **Menü animasyonu:** Masaüstü mega menü opacity/translate ile, mobil ana menü ve alt menüler max-height/opacity geçişleriyle açılır. Azaltılmış hareket tercihi desteklenir.
5. **Kartlar:** Hover/focus durumları daha yumuşak yükselme, renk ve sınır geçişleri kullanır. Kategori, haber, modül ve proje kartlarında uyumlu ritim uygulandı.
6. **Sıkışık düzenler:** Dört sütunlu mühendislik/süreç kartları orta genişlikte iki, mobilde bir sütuna düşer; haber ve split-feature alanları küçük ekranda tek sütuna geçer. Formlar `minmax(0, ...)` ile taşmaya karşı korunur.
7. **Kurumsal Antalya alanı:** Arka planın düşük opaklıklı fotoğrafı, Wikimedia Commons'ta **Cobija** tarafından yayımlanan `Marina, Antalya.JPG` görüntüsüdür. **CC0**, kaynak: https://commons.wikimedia.org/wiki/File:Marina,_Antalya.JPG. Şirket tesisi fotoğrafı olduğu iddia edilmez. Görsel dış CDN'den yüklendiğinden ağ yoksa yalnızca lacivert degradeli yedek zemin görünür.
8. **404:** Aynı renk ve başlık diline uyarlandı.

## Kod ve içerik korunumu

- `app.js` içindeki ana sayfa ve tüm iç sayfa içerik üreticileri **ana dalla byte düzeyinde aynı**. Sadece header'ın dil seçici HTML'i, seçicinin aç/kapat davranışı ve mobil genişlik eşiği değişti.
- `motion.js`, içerik, gerçek medya dosyaları ve sayfa yolları değiştirilmedi.
- `noindex,nofollow` ve temsilî görsellerle ilgili mevcut sınırlar korunur.
- 21 içerik HTML dosyası `theme-kaan.css` dosyasını en son stil katmanı olarak yükler; özel 404 sayfasında eşleşen yerel stil bulunur.

## Yapılan kontroller / sınırları

- JS sözdizimi V8 ile doğrulandı; CSS parantez dengesi kontrol edildi.
- Sayfa içerik gövdelerinin ana dal ile birebir aynı olduğu doğrulandı.
- Tüm sayfaların menü ve stylesheet bağlantıları kaynak düzeyinde kontrol edildi.
- **Gerçek cihaz/tarayıcı testleri henüz yapılmadı.** 390px mobil, 980–1440px masaüstü ve özellikle %125/%150 yakınlaştırmanın görsel olarak kontrolü ayrıca gereklidir. Kaynak düzeyi doğrulama, gerçek yatay taşma ve font yüklenme testinin yerini tutmaz.

## Gelecekte değişiklik

Yeni müşteri içeriği geldiğinde sayfa yapısı değişebilir; bu görsel revizyon, içerik modelini veya doğrulanmamış mühendislik iddialarını etkilemez.
