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
