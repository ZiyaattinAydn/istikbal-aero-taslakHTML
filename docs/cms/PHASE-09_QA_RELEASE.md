# İSTİKBAL AEROSPACE — Aşama 9: Kaynak QA ve kontrollü staging hazırlığı

**Tarih:** 13 Kasım 2026  
**Kaynak:** `feat/cms-security-controls` / PR #22; qa branch `feat/cms-release-qa`  
**Karar:** **KOD QA GEÇTİ / HOSTED STAGING NO-GO** — henüz müşteri teslimi veya üretim yayını yok.

## 1. Doğrulanmış otomatik QA kanıtı

GitHub Actions: https://github.com/ZiyaattinAydn/istikbal-aerospace-web/actions/runs/43328311914
Kaynak commit: `2e2f00aa11690f2b79497e7486f90aa2fd9eea74`.

| CI işi | Sonuç | Kanıt / sınır |
| --- | --- | --- |
| checks | **PASS** | `npm ci`, 0 dependency advisory, TypeScript, lint, **91 birim testi**, schema/seed/snapshot envanteri, Next.js build |
| cms-local-auth | **PASS** | İzole Supabase + Mailpit, **20 Auth/RLS/API doğrulaması**, gerçek OTP/TOTP tarayıcı akışı, 21 sayfada düzenle/kaydet/önizle/doğrudan yayımla/geri al/tekrar yayımla, medya yükleme/izin geri çekme, mobil |
| browser (dev) | **PASS** | **71** Playwright testi, 21 sayfa / responsive / animasyon / navigasyon |
| browser (production) | **PASS** | **71** Playwright testi, gerçek Next.js production build üzerinde |
| cms-performance | **PASS** | Öncesi/sonrası yerel tarayıcı karşılaştırma artefaktı; **Cloudflare runtime ölçümü değildir** |

Ek offline gate: `npm run cms:release:check` — 21 sayfa, 537 kontrollü alan, 43 görsel alanı, 9 statik site varlığı, 13 mevcut içerik kaydının tekilliği, onaysız doğrudan yayın/yayından kaldırma migration sözleşmesini **ağ erişimi olmadan** denetler. Bu kontrol hosted yayına izin vermez.

## 2. Hosted Supabase salt-okunur gerçek durum (13 Kasım)

Proje `uftnykormtwlzolwbhfb`; SQL sorguları **yalnız SELECT**, hiçbir tablo, migration, kullanıcı veya dosya değiştirilmedi.

| Tablo | Mevcut |
| --- | ---: |
| `cms_roles` | 1 |
| `cms_documents` | 21 |
| `cms_page_fields` | 537 |
| `cms_versions` | 21 |
| `cms_published` | 0 |
| `cms_media` | 0 |
| `cms_relations` | 0 |
| `cms_audit` | 0 |

Hosted migration listesi 5 eski CMS migration'ı içeriyor. **`20261113013600_cms_direct_publication.sql` henüz uygulanmamış.** Hosted `cms_private.mutate` fonksiyonu hâlâ `review` ve `approved` kelimelerini içeriyor; **`unpublish` desteği yok**. Bu doğrudan kod-hosted SQL uyumsuzluğudur ve güncel CMS'in yüklenmesini engelleyen bir release gate'tir.

GitHub migration dosyalarının eski timestamp'leri ile hosted ledger sürümleri eşleşmiyor. **Migration repair / db push / reapply işlemlerini otomatik çalıştırmayın.** Önce gerçek şema ve SQL checksum karşılaştırması, geri yüklemesi kanıtlanmış veritabanı ve Storage yedeği gerekir.

Mevcut haber/proje/platform/teknoloji kanonik kayıtları 13 adettir; hosted `cms_documents` yalnızca 21 `page` belgesinden oluşur. **13 mevcut içerik hâlâ hosted CMS'e aktarılmadı.** İdempotent seed ancak migration mutabakatı ve yedekten sonra, yalnız eksik `(kind,slug)` kayıtlarına uygulanmalıdır. Mevcut kaydı overwrite etme.

Supabase Security Advisor kalan `auth_leaked_password_protection` uyarısını gösteriyor; CMS yalnız e-posta OTP kullandığı için bu, otomatik olarak sömürülebilir bir parola problemi kanıtlamaz. Herhangi bir yeni password auth yöntemini açmayın.

## 3. Kalan hosted kabul kapıları

- **A — Korunabilir geri dönüş:** Gerçek hosted Supabase şema+veri+versiyonlar+Storage+Auth kurtarma stratejisi; yeniden yükleme provası ve kayıpların anlaşılması.
- **B — Migration uzlaştırması:** Mevcut 5 hosted migration'ı dosya içerikleriyle eşleştir. Yalnız gerekli altıncı direct-publication migration'ını kontrollü uygula; eski 5'i tekrar çalıştırma. `cms_private.allowed(true)`, MFA ve publisher kontrolünü yeniden denetle.
- **C — Kanonik veri:** 13 tekil içerik kimliğinin hosted ortamda yokken eklendiğini, tekrar çalıştırıldığında tekrar oluşturulmadığını doğrula; 21/537 ve versiyon geçmişini koru.
- **D — Cloudflare staging:** Doğrulanmış source commit'i **aynı** `istikbal-cms-staging` Worker'a yükle; Dashboard'daki değişken ve sırları **koru**, kör `--force` kullanma. Çalışan Worker ve domain DNS'i değiştirme.
- **E — Gerçek kullanıcı kabulü:** CEO/yetkili kullanıcı e-posta OTP, MFA/QR, oturumun yeniden açılması, giriş/çıkış, 21 sayfa filtre, 13 mevcut içerik düzenleme, statik+özel medya, doğrudan görsel upload, publish/unpublish/restore, mobil, anon erişimi ve performans ölçümleri.
- **F — Public yayına açma:** `CMS_PUBLIC_READS` **kapalı kalacak**; backend ve yayın cache invalidation testi başarılı ve açık kullanıcı onayı olmadan açılmayacak. Prod domain/DNS **teslimin en son adımı**.

## 4. Gözden kaçmaması gereken riskler

- CI localhost/Auth simülasyonu gerçek Cloudflare Workers CPU limiti, Storage dosya boyutu, SSR cookie davranışı, Workers cache/tag invalidation veya SMTP sağlayıcısını kanıtlamaz.
- Kaydedilmemiş görsel seçimi önce özel medyaya yüklenebilir; yayın hakkı verilmeden herkese açık yayına çıkmamalıdır.
- Supabase yüklemesi başarılı olup metadata insert başarısızsa özel Storage'da yetkisiz erişilemeyen orphan dosya oluşabilir. Otomatik toplu silme yapmayın; kontrollü temizleme işletimi gerekebilir.
- Site üzerindeki tüm görsellerin/görsel alanlarının manuel gerçek görüntüsü, kontrast ve klavye/screen reader kullanımı gerektiğinde ayrı acceptance maddesidir.
- Vercel build-rate-limit, Vercel preview kanıtının şu an kullanılamamasına neden oldu; **ücretli plan gerekmiyor**. GitHub Actions CI üzerinden kod QA doğrulandı.

**Aşama 9 sonucu:** Kod ve güvenlik için CI kanıtı yeşil. Sadece CI başarılı diye Supabase migration veya production yayını yapmak güvenli değildir. Sonraki aşama kontrollü hosted geçiş + Cloudflare kabulü.
