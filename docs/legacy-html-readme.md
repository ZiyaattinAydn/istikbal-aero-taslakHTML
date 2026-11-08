# İstikbal Aerospace — HTML prototipi

Bu depo İstikbal Aerospace için hazırlanan statik web sitesi **önizlemesidir**.

- GitHub Pages: https://ziyaattinaydn.github.io/istikbal-aero-taslakHTML/
- Kaynak: `main`, depo kökü.
- Toplam 21 içerik HTML sayfası ve özel 404 sayfası.
- İçerikler: `app.js`; animasyonlar: `motion.js`; tasarım: dört CSS dosyası; görseller: `assets/`.
- Görseller temsili prototip varlıklarıdır, resmî şirket fotoğrafları değildir.
- İletişim formu yalnızca yerel doğrulama yapar, mesaj göndermez.
- Önizleme sayfaları bilerek `noindex,nofollow` işaretlidir.

## İnceleme ve müşteri onayı
- [İçerik Envanteri](docs/icerik-envanteri-2026-11-08.md)
- [QA ve Yayın Kontrolü](docs/qa-ve-yayin-kontrolu-2026-11-08.md)

Gerçek marka görselleri, şirket onaylı ürün/proje teknik verileri, duyuru kaynakları ve eski sitenin tam arşivi gelmeden bu çalışmayı üretim sitesi olarak yayınlamayın. Canlı cihaz ve tarayıcı testleri de tamamlanmalıdır.

## Bilgi mimarisi ve içerik girişi

- Yedi ana menü korunur; Platformlar ve Teknolojiler için alt menüler vardır.
- Bütün sayfalarda tekrar eden iletişim bandı kaldırılmıştır. Ana sayfada tek bir iletişim çağrısı ve ayrı İletişim sayfası bulunur.
- Gereksiz bölüm sonu yönlendirmeleri temizlenmiştir; gerçek ürün, teknoloji ve haber kartlarının detay bağlantıları durur.
- `app.js` içindeki `PUBLIC_WORKS` ve `PUBLIC_NEWS` ayrı statik kaynak dizileridir. Bunlar gelecekteki CMS için başlangıç düzenidir; **CMS yönetim paneli henüz kurulmadı**.
- [Abdullah için içerik giriş formatı](docs/abdullah-icerik-giris-sablonu.md)
- [Yönlendirme temizliği ve içerik koruma değerlendirmesi](docs/yonlendirme-ve-icerik-denetimi-2026-11-08.md)

**Not:** Gereksiz yönlendirmeler çıkarılırken sayfaların temel teknik ve kurumsal bilgileri tutulmuş, bazı tekrar eden metinler birleştirilmiştir.

## Kod incelemesi sonrası notlar (8 Kasım 2026)

- Prototip logosu, kullanıcı tarafından seçilen **mavi katman simgesine** dönüştürüldü; resmî kurumsal logo onayı beklenir. `assets/favicon.svg` aynı simgedir.
- İç sayfalar tarayıcının doğal kaydırmasını kullanır. Ana sayfa ise özellikle istenen bölüm bölüm fare deneyimini korur; touchpad ayırımı sezgiseldir.
- Haber detayları `PUBLIC_NEWS` verisine bağlıdır. İki eski haber URL'si korunur; yeni içerikler için `haber-detay.html?id=<yayın-kimliği>` kullanılabilir. İstemci tarafı metinler HTML kaçışıyla işlenir.
- 21 içerik sayfasına temel Open Graph başlık/açıklaması ve favicon tanımı eklendi. Üretim alan adı henüz kesin olmadığı için canonical ve `og:url` eklenmedi; resmî sosyal görsel onayı olmadan `og:image` belirlenmedi.
- Dağıtım hakları/müşteri sahipliği netleşmeden **LICENSE dosyası eklenmedi**. Lisanslama kararını proje sahibi vermelidir.
- Footer ve İletişim sayfasındaki e-posta/telefon yayında bulunmaktadır; şirket temsilcisi bunların genel erişime açık kullanılmasına izin verdiğini doğrulamalıdır. İzin gelmeden sahte bir `info@` adresi oluşturulmadı.
- Sayfalar hâlâ istemci tarafında `app.js` ile üretilir. Statik ön üretim/SSR dönüşümü müşteri onaylı üretim aşaması için ayrı iştir.
- Kaynak ve gerekçeler: [Claude bulguları doğrulama ve teslim raporu](docs/claude-inceleme-dogrulama-2026-11-08.md).
