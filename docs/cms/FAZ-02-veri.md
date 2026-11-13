# FAZ 02 — İçerik modeli ve aktarım

11 Kasım 2026 devam çalışması. Şema ve taslak aktarımı tamamlandı; üretim veri geçişi kapalıdır.

21 rota için 537 gerçek kontrollü alan özgün React şablonlarına bağlandı. Dört migration, alan kaydı, 21 idempotent taslak ve private Storage yalnız yeni bağımsız Free projeye uygulandı. Onay/yayın durumu/ürün aşaması ayrıdır; sürüm/audit ve kilitli yazma korunur.

Envanter/snapshot/seed/page check ve PGlite güvenlik/idempotency testleri geçti. Hosted sayım 21/537; anonim taslak sorgusu reddedildi; security advisors temiz. Gerçek yerel Auth/API/Storage CI testi de geçti. [DATA_MODEL.md](DATA_MODEL.md), [STATUS.md](STATUS.md).

Hosting GO olmadığı için public okuma anahtarı açılmadı; başka veritabanı ve canlı site değiştirilmedi.
