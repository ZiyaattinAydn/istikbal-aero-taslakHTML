# İstikbal Aerospace — Next.js migrasyonu

Mevcut HTML prototipinin tasarımını ve 21 sayfalık içeriğini koruyan Next.js App Router, React ve TypeScript uygulaması.

- Geliştirme branch'i: `feat/nextjs-react-typescript`.
- `main` ve GitHub Pages, mevcut HTML sürümünde bırakılmıştır.
- Üretim yayını yapılmamıştır. Next.js uygulaması Vercel'in standart Next.js kurulumu için hazırdır.
- Görseller temsili prototip varlıklarıdır; şirket onayıyla gerçek marka görselleriyle değiştirilebilir.
- `noindex,nofollow` korunur. EN pasiftir. İletişim formu yalnızca yerel doğrulama yapar, mesaj göndermez ve veri saklamaz.

## Yerel çalışma

Node.js 20.9 veya üstü (doğrulanan ortam: Node.js 24).

```sh
npm ci
npm run dev
```

Production build'i yerelde incelemek için:

```sh
npm run build
npm start
```

`npm run preview -- --port 4173` aynı production build'ini genel önizleme araçlarıyla çalıştırır. Önce build alınmalıdır. `scripts/dev.mjs` ve `scripts/preview.mjs`, genel başlatıcıların `--host` parametresini Next'in `--hostname` parametresine dönüştürür.

## Doğrulama

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:legacy
```

26 test; 21 sayfanın ana içerik, header/footer metinlerini eski render çıktısıyla karşılaştırır. Eski ve temiz URL eşlemeleri, haber kimlikleri, güvenli URL'ler, listener temizliği ve görsel dosyalarının değişmediği ayrıca kontrol edilir.

İsteğe bağlı görsel karşılaştırma dosyalarını üretmek için `node scripts/create-browser-fixtures.mjs` çalıştırın. `/qa/index.html`, `/qa/teknolojiler.html`, `/qa/haberler.html` ve `/qa/iletisim.html` eski ve yeni sürümü altı CSS viewport genişliğinde yan yana gösterir. Bu geçici dosyalar Git'e alınmaz; yayın paketinden önce `public/qa` klasörünü kaldırın.

## Yapı

- `src/app`: App Router, metadata, 404 ve URL eşlemeleri.
- `src/components/layout`, `navigation`, `home`, `cards`, `ui`, `pages`: ortak bileşenler ve sayfa içerikleri.
- `src/data`: typed navigasyon, kartlar, yayınlar, teknoloji/platform bilgileri ve route envanteri.
- `src/hooks`: menü genişliği ölçümü ve animasyon yaşam döngüsü.
- `src/lib`: haber seçimi, güvenli URL yardımcıları, route kapsamlı event registry ve sinematik animasyon motoru.
- `src/styles`: mevcut beş CSS katmanı, kaynak sırası korunarak.
- `public/assets`: değiştirilmeden taşınan görseller ve favicon.
- `tests`: içerik koruma ve güvenlik regresyonları.

Tüm eski `.html` sayfaları doğrudan App Router üzerinden açılır; uzantısız karşılıkları da vardır. `/` ve `/index.html` ana sayfadır. Haber detayları `?id=<yayın-kimliği>` kullanır; geçersiz kimlikler kaynak sürümdeki “İçerik bulunamadı” görünümünü gösterir.

Depo kökündeki orijinal HTML/CSS/JS ve `assets/`, referans ve regresyon karşılaştırmaları için korunmuştur. Yeni uygulama bu scriptleri çalıştırmaz. Önceki README: [HTML sürümü belgesi](docs/legacy-html-readme.md).

Ayrıntılı kapsam, testler ve doğrulanamayan cihaz/zoom kontrolleri: [MIGRATION_REPORT.md](MIGRATION_REPORT.md).

Supabase, veritabanı, authentication, yönetim paneli ve mesaj gönderme servisi bu kapsamda kurulmamıştır. Yeni şirket bilgileri veya teknik başarı iddiaları eklenmemiştir.
