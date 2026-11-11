# FAZ 05 — Kayıt ve medya yönetimi

11 Kasım 2026. Kısmi; ilişkiler ve kullanıcı kabulü açık.

Haber/proje/platform/teknoloji/kabiliyet CRUD, arama/sayfalama, nullable tarih, otomatik sabit URL, taslak/onay/yayın/arşiv/geri alma vardır. Tekrarlanan create ikinci kayıt oluşturmaz. Korumalı yeni kayıt önizlemesi ile public /icerik/[kind]/[slug] aynı EntryContent şablonudur. Public anahtar açıldığında kayıtlar ilgili listelere eklenir; haberlerde yeni kartlar mevcut filtreli listeden ayrı bir bölümdür.

Medya yükleme/seçme ve yayıncı public kullanım onayı vardır. Tarayıcı en fazla 2000 px WebP üretir; metadata çıkarılır. Sunucu imza, MIME, boyut/piksel alanı ve 5 MB limitini doğrular. Alt metin ve telif izni gerekir. Private bucket/RLS ve yayın sırasında özel medya reddi korunur.

Yerel 53 test SQL rol/onay/concurrency/restore/retry, medya doğrulama ve ortak önizleme şablonunu kapsar. CLI 15 kontrol gerçek Auth/API/Storage akışını geçti. Typecheck/lint/build/audit başarılı.

Eksikler: ilişki düzenleyicisi/public ilişki kartları; yeni kayıt kapak seçici; medya alt metnini sonradan düzenleme/silme/izin geri çekme; gerçek UI kabulü ve ağda save p95. Statik ilişkiler korunur. [STATUS.md](STATUS.md).
