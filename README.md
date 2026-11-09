# İstikbal Aerospace — Website

Next.js 16 App Router, React 19 ve TypeScript ile geliştirilen 21 sayfalık İstikbal Aerospace web sitesi.

## Branch düzeni

- **main:** Next.js uygulaması, testler, içerik, görseller ve GitHub Actions.
- **legacy/html-prototype:** Eski HTML / CSS / JavaScript prototipinin tamamı (kaynak commit `dc00abb5`). Statik GitHub Pages yayını için bu branch kullanılmalıdır.
- Eski `.html` URL'leri Next.js router'da desteklenir; HTML dosyaları ana branch'te gerekli değildir.
- Repo adı: `ZiyaattinAydn/istikbal-aerospace-web`.

## Başlangıç

Node.js 22+ önerilir.

```bash
npm ci
npm run dev
```

Production doğrulaması:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Development ortamında tarayıcı QA: `TEST_SERVER_MODE=dev npm run test:browser` (PowerShell: `$env:TEST_SERVER_MODE='dev'; npm run test:browser`).

## Mimari

- `src/app`: App Router, metadata ve URL'ler
- `src/components`: header, menüler, kartlar, sayfalar, formlar
- `src/data`: içerik modelleri, haberler, route eşlemeleri
- `src/lib/cinematic.ts`: sinematik ana sayfa kaydırması
- `src/styles`: özgün tasarımın katmanlı CSS dosyaları
- `public/assets`: uygulama görselleri
- `tests/browser`: Playwright Chromium E2E testleri

Eski HTML sürümüne özgü render karşılaştırmaları, JS kontrol scriptleri ve statik site kaynakları `legacy/html-prototype` branch'inde korunmuştur. Ana branch'in içerik bütünlüğü artık TypeScript/React SSR testleri ve Playwright E2E testleriyle doğrulanır. Kaynak sürümle yapılan önceki karşılaştırmanın çıktıları `docs/qa` içinde bulunmaktadır.

## Yayın ve sınırlar

Bu branch'in main'e taşınması **otomatik olarak Next.js sitesi yayınlamak anlamına gelmez.** GitHub Pages statik HTML prototipi yayınlayacaksa `legacy/html-prototype` / `(root)` kaynak seçilmelidir. Next.js sunucu gerektiren özellikler için Next.js destekleyen ayrı bir hosting gerekir.

- `noindex,nofollow` hâlen etkin.
- İletişim formu yalnızca yerel doğrulama yapar; mesaj göndermez.
- İngilizce dil seçimi henüz aktif değil.
- Fiziksel scroll, gerçek tarayıcı zoom, Safari/Firefox ve ekran okuyucu testleri ayrıca yapılmalıdır.
- Yayına çıkmadan önce şirketin içerik/görsel onayı gereklidir.

Ayrıntılı eski migrasyon QA kanıtları: [MIGRATION_REPORT.md](MIGRATION_REPORT.md).
