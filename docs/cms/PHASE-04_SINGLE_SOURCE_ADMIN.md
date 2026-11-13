# İstikbal Aerospace CMS — 4. aşama: Tekil içerik yönetim ekranı

**Branch:** `feat/cms-single-source-admin`  
**Base:** `feat/cms-existing-content-bridge` / PR #17  
**Durum:** Kod inceleme ve CI için draft. **Üretim/staging GO değil.**

## Amaç

Abdullah'ın aynı haber, proje, platform veya teknoloji kartını her sayfada ayrı ayrı değiştirmesini önlemek. 21 mevcut kurumsal sayfa ve 537 alan anahtarı, URL'ler ve sürüm geçmişi korunur.

## Değişiklikler

- `/admin/library`: Yetkili ve MFA doğrulanmış yönetici için tekil haber, proje, platform, teknoloji ve kabiliyet kütüphanesi.
- `ContentLibrary`: 13 bilinen mevcut kaydı ve yeni CMS kayıtlarını bir araya getirir; Türkçe arama, tür ve durum filtreleriyle gösterir. Veri tabanına taşınmamış içerikler açıkça **Aktarım bekliyor** olarak gösterilir; erişilemeyen UUID'lere sahte düzenleme linki verilmez.
- Ana yönetici menüsü ve dashboard'dan kütüphaneye erişim.
- `canonicalContentForPage`: `src/data/cms-page-schema.json` şemasındaki alanları kanonik bir kayda atayan kayıpsız saf eşleme. Aynı içerik farklı sayfada tekrar görünse bile `(kind,slug)` tek kayda işaret eder.
- `PageEditor`: Tekil CMS dokümanı gerçekten varsa o kaydın metin, özet ve görsel alanlarını sayfa editöründe ikinci kez yazılabilir göstermeyip gerçek `/admin/content/:uuid` editörüne bağlar. Yalnızca editör kontrolleri değişir: kaydedilmiş `body.fields` ve versiyonlar **silinmez**.
- Kaydı henüz aktarılmamış içeriklerde mevcut sayfa alanları eskisi gibi düzenlenebilir. Yanlış bir otomatik seed işlemi mevcut site düzenlemelerini ezemez.
- Görsel önizlemede yönetimi devredilmiş bir alan tıklanırsa sayfanın ilgili ortak içerik kartına kaydırılır.
- `tests/cms-single-source-admin.test.ts`: 21 sayfa / 537 alanın korunması, paylaşılmış alan sahipliği, çift editörün gizlenmesi ve aktarımı bekleyen içeriklerde sahte link olmaması.

## İşletim ve güvenlik koşulları

1. `requireAdmin()` tüm erişimlerde AAL2 ve etkin rol doğrular. Mevcut şifre/kod/MFA/RLS politikaları değiştirilmedi.
2. Bu aşamada yeni veritabanı, migration, SMTP, Storage veya domain değişikliği yok. Depo `main` dalına merge edilmedi; Cloudflare staging'e deploy yapılmadı.
3. Kütüphanede kayıt oluşturma ve otomatik geçiş bilerek yok: mevcut sayfalarda geçmişten kaydedilmiş değerler olabileceğinden, 13 kayıt **yedekli ve karşılaştırmalı staging aktarımı** sonrasında bağlanmalı.
4. CMS'de bulunan fakat henüz yayımlanmamış kayıtlar sayfa editöründe tek kaynak olarak kabul edilir; gerçek site, ilk yayın tamamlanana kadar mevcut yayını/statik içeriği korur.
5. Kütüphane ilk 250 CMS kaydını getirir; daha eski içerikler için mevcut dashboard araması kullanılabilir. Yüksek hacim ve sunucu tarafı sayfalama sonraki iyileştirmedir.
6. Editör / sayfa verisi hem canlı snapshot hem taslak olarak kalır. Görsel önizleme canlı yayınla birebir eşleşme konusu 6. aşamada ele alınacak.
7. Direct publish/unpublish 7. aşama; public medya görünürlüğü 5. aşama; migration ledger ve staging kabulü sonraki dağıtım güvenlik kapılarındadır.

## Test ve kabul

- GitHub Actions: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, CMS envanter/snapshot/seed/page kontrolü, `npm run build`.
- Playwright: development ve production regression testleri, admin izole OTP/TOTP/CRUD testleri, performans karşılaştırması.
- Manual staging: seeded + unseeded kanonik kayıtlarla mobil/desktop görüntüleme ve doğrudan editör linki kabulü.
- **CI yeşil olmadan 4. aşama kod kabulü yok; staging canlı kabul yapılmadan üretim GO yok.**
