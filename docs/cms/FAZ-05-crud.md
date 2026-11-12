# FAZ 05 — Kayıt ve medya yönetimi

11 Kasım 2026. Kısmi; ilişkiler ve kullanıcı kabulü açık.

Haber/proje/platform/teknoloji/kabiliyet CRUD, arama/sayfalama, nullable tarih, otomatik sabit URL, taslak/onay/yayın/arşiv/geri alma vardır. Tekrarlanan create ikinci kayıt oluşturmaz. Korumalı yeni kayıt önizlemesi ile public /icerik/[kind]/[slug] aynı EntryContent şablonudur. Public anahtar açıldığında kayıtlar ilgili listelere eklenir; haberlerde yeni kartlar mevcut filtreli listeden ayrı bir bölümdür.

Medya yükleme/seçme ve yayıncı public kullanım onayı vardır. Tarayıcı en fazla 2000 px WebP üretir; metadata çıkarılır. Sunucu imza, MIME, boyut/piksel alanı ve 5 MB limitini doğrular. Alt metin ve telif izni gerekir. Private bucket/RLS ve yayın sırasında özel medya reddi korunur.

Yerel 53 test SQL rol/onay/concurrency/restore/retry, medya doğrulama ve ortak önizleme şablonunu kapsar. CLI 15 kontrol gerçek Auth/API/Storage akışını geçti. Typecheck/lint/build/audit başarılı.

12 Kasım tamamlama: ilişki/kapak, public ilişkili hedefler ve medya metadata/izin geri çekme kodu eklendi. SQL negatif testleri ve version restore geçer. Yeni migration hosted uygulandı ve advisors temiz. Gerçek birleşik UI sonucu STATUS.md'dedir. Medya dosyası silme kullanıcı kapsamına alınmadı; izin geri çekme ve taslak koruma vardır. Seçiciler 200 ilişki / 100 medya ile sınırlıdır; çok büyük kütüphane araması/sayfalaması sonraki ölçek işidir.
