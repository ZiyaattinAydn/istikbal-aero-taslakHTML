# CMS durumu — 11 Kasım 2026

**Teslim: geliştirme temeli; üretime hazır CMS değil. Hosting: NO-GO.**

Başlangıç: `41e5581`; branch: `feat/cms-foundation`. Ana plan ve Work prompt bütünüyle okundu. `main`, DNS, şirket yayını ve bağlı diğer Supabase projeleri değiştirilmedi. Yeni servis, abonelik, kart veya ücret açılmadı.

| Faz | Durum | Gerçek sonuç / çıkış engeli |
|---|---|---|
| 0 | Keşif tamamlandı; dış sahiplik teyidi bekliyor | Güncel kaynak, güvenlik/CI, içerik belgeleri ve 21 rota incelendi; ayrı branch ve geri dönüş planı hazır. Domain/Cloudflare yetkisi doğrulanmadı. |
| 1 | Kısmi, üretim NO-GO | vinext kaynak kontrolü ve izole Cloudflare build geçti. Worker runtime önizlemesi ortam kısıtı nedeniyle açılamadı. CPU/cache/auth/upload staging ölçümü ve gerçek tarayıcı performansı yok. |
| 2 | Kısmi | 21 rota, 28 dosya, 1.276 kaynak literal; SSR metin/medya/bağlantı snapshot'ları; sürümlü SQL, RLS, yayın snapshot ayrımı ve tekrar çalıştırılabilir 21 taslak fixture. Tam bölüm alanı → şablon eşlemesi henüz yok. |
| 3 | Kısmi | Kapalı varsayılan `/admin`; OTP (`shouldCreateUser:false`), TOTP kurulum/doğrulama, sunucu rol kontrolü, admin-only oturum yenileme. Gerçek Auth/SMTP/MFA kabulü ve abuse testleri bekliyor. |
| 4 | Bağlı entegrasyon bloke | Mevcut sayfa metinleri korumalı envanter ekranında okunabilir. Bölüm düzenleme, özgün şablonda taslak önizleme, public veri geçişi ve hedefli cache yenileme uygulanmadı. |
| 5 | Kısmi | Haber/proje/platform/teknoloji/kabiliyet kaydı oluşturma, arama/sayfalama, taslak, inceleme/onay, yayın deposu, arşiv ve sürüm geri alma kodu var. Medya kütüphanesi/upload servisi, ilişki düzenleyicisi ve public liste/detay bağlantısı yok. |
| 6 | Kısmi | Typecheck/lint/build, 29 test, RLS negatif senaryoları, seed idempotency ve HTTP kıyası geçti. Yerel Chromium engelli; uygulama kodu CI’da development ve production 71/71 tarayıcı testini geçti. Fiziksel cihaz ve Abdullah kabulü ayrıca doğrulanmalı. |

## Açık engeller ve sonraki iş sırası

1. Mevcut domain/DNS ve Cloudflare hesabının yetkili sahibi belirlenmeli. Ücretsiz staging ortamında Worker CPU, kalıcı cache, yayın yenileme, oturum ve dosya işlemleri ölçülmeli. GO olmadan büyük public migrasyon yok.
2. İstikbal'e ayrılmış, maliyeti doğrulanmış ücretsiz Supabase projesi belirlenmeli. Bağlı hesapta İstikbal projesi yok; başka müşterilerin projeleri kullanılmadı. Proje oluşturulmadı.
3. Abdullah'ın yetkili e-posta adresi ve yayın rolü, ücretsiz özel SMTP hesabı ve gönderici domain onayı gerekli. Varsayılan SMTP üretim çözümü sayılmadı.
4. SQL'i yalnızca izole staging'e uygula; gerçek Supabase RLS/Auth/session davranışı, oturum iptali ve OTP rate limit/teslim testlerini yap. Sonra 21 sayfanın kontrollü bölüm alanlarını şablonlara kademeli bağla.
5. Özgün şablon önizleme, yayın cache yenilemesi, yeni kayıtların URL/kart bağları, özel medya ve ilişkiler; sonra gerçek önce/sonra tarayıcı performansı, responsive/animasyon, kullanıcı kabulü.

## Kanıtlar

- [Performans raporu](PERFORMANCE.md), [veri sözlüğü](DATA_MODEL.md), [işletim/kurulum](RUNBOOK.md).
- `content-inventory.json`: tüm literal'leri kaynak satırı ve hash'iyle tutar. **1.276 düzenlenebilir alan iddiası değildir**; import/CSS/teknik değerler de vardır; `candidate` yalnızca ön elemedir.
- `page-snapshots.json`: 21 sayfanın mevcut render metni, medya ve bağlantıları. Seed fixture'ları tam bölüm migrasyonu değildir.
- Faz raporları `FAZ-00`–`FAZ-06`; test çıktıları `evidence/`.

## Karar günlüğü

- Bütün fazlar sırayla ele alındı; FAZ 1 çıkış kapısı geçilmediği için bağımsız yerel geliştirme sürdürüldü, canlı veri geçişi yapılmadı.
- Public sayfa bileşenleri/verileri/asset'leri değiştirilmedi. Admin kodu rota bazında ayrıldı; proxy yalnızca `/admin/:path*` eşleşir.
- Yayınlanmış snapshot ile çalışma taslağı farklı tabloda tutulur. Taslak kaydetme mevcut yayın snapshot'ını değiştirmez.
- Panelde "yayın deposuna al" ifadesi özellikle kullanılır: işlem mevcut sitede görünür yayın anlamına gelmez.

PR: https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/13 (taslak). Doğrulanan uygulama commit’i: `4e61a7cfdde20e59bffb9075d169d403a2e297f2`. CI’da checks, CodeQL, development 71/71 ve production 71/71 tarayıcı testi başarılı. [CI kanıtı](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43017113600). Sonraki rapor güncellemesi yalnız belgelerdir. Lokal ve uzak commit kimlikleri aktarım yöntemi nedeniyle farklıdır; ilk aktarımın Git tree hash eşitliği doğrulandı.
