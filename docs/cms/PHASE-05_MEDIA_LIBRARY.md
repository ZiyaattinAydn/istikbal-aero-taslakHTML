# İSTİKBAL AEROSPACE — Aşama 5: Birleşik medya kütüphanesi ve sayfadan görsel yükleme

**Branch:** `feat/cms-unified-media-library`  
**Hedef PR:** önceki 4. aşama `feat/cms-single-source-admin` / PR #18  
**Durum:** Kod + CI doğrulaması, staging'e dağıtım yok.

## Sorun / veri kökeni

- Site `public/assets/` altında **9 mevcut görsel** taşıyor: favicon dahil SVG ve WebP dosyaları.
- 21 sayfalık şemada **43 görsel alanı** var ve bu alanların varsayılan dosyaları sitedeki mevcut kataloğa ait.
- Daha önce `/admin/media` sadece `cms_media` kayıtlarını listeliyordu. Bu yüzden kullanıcı görselleri zaten sitede olduğu halde kütüphaneyi boş görüyordu.
- Sayfa editöründeki teknik `select` önce görselin kütüphaneye yüklenmesini gerektiriyordu.

## Yapılanlar

1. `src/lib/cms/site-media.ts` — `public/assets` altındaki 9 görselin, kullanıcı dostu isimlerinin, güvenli URL'sinin salt-okunur envanteri. **Mevcut dosyalar Storage'a yeniden yüklenmedi, `cms_media` tablosuna kopya açılmadı.**
2. `src/components/admin/MediaLibraryGallery.tsx` — mevcut site görselleri ve Storage dosyaları aynı kütüphane ekranında, görsel önizleme, arama ve kaynak filtresiyle listelenir. Yüklenenlerin düzenleme ve yayın izni kontrolleri aynen korunur.
3. `src/components/admin/ImageFieldPicker.tsx` — sayfa editöründe görsel önizleme, mevcut site görseli seçme, özel kütüphaneden seçme, bilgisayardan doğrudan yükleme. İçerik editöründe kapak seçimi de aynı bileşeni kullanır.
4. `src/lib/cms/prepare-webp.ts` — mevcut 15 MB ham dosya / 24 MP sınırı, maksimum 2000 piksel dönüştürme, 5 MB WebP sınırı ve EXIF/metadata temizleme tek bir istemci yardımcısına taşındı; kütüphane ve sayfa içi yükleyici aynı kodu çağırır.
5. `src/app/admin/media/actions.ts` — mevcut `requireAdmin()` / AAL2 + Storage bucket doğrulaması üzerinden yüklenen dosyanın ID'si yalnız başarılı yanıtta çağıran editöre döner. İstemci **service_role** anahtarına erişmez. Yüklenen dosya varsayılan **private** olur; yayın izni `cms_manage_media` işlemiyle ayrıca verilmelidir.
6. `ContentEditor` kapak alanı insan dostu görsel seçiciye taşındı; mevcut `cover_id` UUID ve form kaydı korunur.
7. `tests/cms-site-media.test.ts` — 9 gerçek dosya, 43 görsel alanı, tüm statik yollar ve UUID/URL izin listesi.
8. `scripts/cms/ui-auth.mjs` — yerel gerçek OTP/TOTP oturumunda mevcut görsellerin görünmesi, sayfa editöründen **kütüphaneye önceden gitmeden** görsel yükleme, taslağa kaydetme, özel görsele anonim erişimin engellenmesi ve kapak seçiminin çalışması.

## Güvenlik / ayrımlar

- Mevcut `/assets/*.webp|svg` yolları değişmez. Statik görselleri herkese açık tutmak, sitede zaten kullanılan varlıkların mevcut davranışıdır.
- Yöneticiye yüklenen görseller yalnız `/admin/media/:id/file` üzerinden MFA yetkisiyle gösterilir. `/cms-media/:id` yalnız yayın izni `public` ise dosya döndürür; gizli dosyalar 404 olarak kalır.
- Yüklemenin başarılı olması sayfa taslağını otomatik kaydetmez veya yayımlamaz; editör gerekli görsel alanına `cms:<uuid>` değeri atar, **Taslak kaydet** gerekir.
- Inline picker içinde ikinci bir HTML formu yoktur; server action elle oluşturulan FormData ile doğrudan çağrılır.
- RLS, MFA, Auth, SQL migration, Supabase bucket görünürlüğü ve mevcut yayın akışı değiştirilmez.
- Kasıtlı olarak yeni dosyalara otomatik `public` izni verilmez; mevcut sahibin içerik kullanım hakkı kontrolü ve yetkili yayın onayı korunur.
- 0 TL ek servis maliyeti hedefi korunur. Yeni Storage yüklemelerinin ücretsiz kota limitleri izlenmelidir.

## Test/kabul kapıları

- `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `cms:inventory:check`, `cms:snapshots:check`, `cms:seed:check`, `cms:pages:check`, `npm run build` ve iki modda Playwright.
- Yalnız izole Supabase içinde gerçek OTP, TOTP, RLS, Storage, izin verme/geri alma, 21 sayfa + 43 görsel alanı, mobil overflow ve doğrudan yükleme doğrulanır.
- Üretim veya Cloudflare staging deployu **yapılmayacak**. Sonraki kontrollü staging kabulünde yönetici telefon/masaüstü görsel seçimi ve görsel yayınlanması tekrar test edilmeli.
- **Draft/NO-GO**: CI yeşil olmadan merge yok; gerçek Cloudflare kabulü olmadan üretim GO yok.

## Sonraki aşamalar

6. aşama: görsel editörde deterministik tıklama/eşleştirme, tam ekran ve kaydetmeden önizleme tutarlılığı. 7. aşama: CEO için doğrudan yayın + güvenli yayından kaldırma. 8–10: güvenlik ve Cloudflare staging üretim kabulü.
