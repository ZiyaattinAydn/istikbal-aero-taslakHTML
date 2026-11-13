# FAZ 04 — Mevcut sayfa düzenleme

11 Kasım 2026. Kod hazır; gerçek kullanıcı/staging kabulü bekliyor.

21 şablona 537 kontrollü metin, görsel ve bağlantı alanı bağlandı; yeni Free projede mevcut değerleriyle dolu seed vardır. SEO/alan arama, revision kontrollü taslak, kaydedilmemiş değişiklik uyarısı, inceleme/onay/yayın/arşiv/geri alma desteklenir. Serbest HTML/CSS yoktur.

Korumalı /admin/pages/[slug]/preview public PageContent ile aynı React şablonunu kullanır; admin kabuğu önizleme tasarımını sarmaz. Public okuma yalnız snapshot sorgular; etiketli 300 saniye cache ve hedefli invalidation vardır. Varsayılan kapalıdır; hosting GO olmadan açılmaz.

21 şablon/alan/fallback, seed/snapshot ve eski metin/asset/link testleri geçti. Focus şablonlarının JSX boşluk farkı snapshot'ta güncellendi; normalize içerik korunur. Yerel 53 test/typecheck/lint/build ve CI browser turları başarılı. [PERFORMANCE.md](PERFORMANCE.md) gerçek Chromium kıyasını içerir.

Workers yayın/cache/özel medya, gerçek MFA ile UI düzenlemesi, mobil/fiziksel cihaz kabulü ve public DB okuması açık performans ölçümü bekler. [STATUS.md](STATUS.md).

12 Kasım: gerçek Mailpit OTP + TOTP oturumuyla 21 sayfa edit/save/template preview/publish/restore/republish akışı CI'da geçti. Editör anahtarı slug+revision içerir. İnsan kullanıcı/fiziksel cihaz ve Workers kabulü hâlâ açık.
