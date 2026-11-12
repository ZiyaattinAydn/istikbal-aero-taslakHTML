# İSTİKBAL AEROSPACE — Aşama 7: Doğrudan yayın ve güvenli yayından kaldırma

**Branch:** `feat/cms-direct-publication`  
**Base:** `feat/cms-deterministic-preview` / PR #20  
**Durum:** Draft PR; prod/hosted Supabase/Cloudflare'a uygulanmadı.

## Karar

Abdullah CEO ve yayından sorumlu kişi. CMS'te "İncelemeye gönder" ve "İçeriği onayla" aşamaları **gereksizdir**. İş akışı:

1. Metni veya görseli düzenle → **Taslak kaydet**.
2. MFA (AAL2) doğrulamalı **publisher** yetkisiyle **Yayımla**.
3. Gerekirse **Yayından kaldır** (taslak ve sürüm geçmişi korunur), **Arşivle** ya da önceki sürümü **Taslak olarak geri al**.
4. Yeni taslak kaydedilirken daha önce yayınlanmış içerik ziyaretçilerde *eski yayımlanmış sürüm* olarak korunabilir. Yönetici panelinde "Yayında · Yeni taslak var" gösterilir; tekrar **Yayımla** yeni sürümü yayınlar.

## Uygulanan kod

- Yeni Supabase migration: `supabase/migrations/20261113013600_cms_direct_publication.sql`. Mevcut `cms_private.mutate` kilitli transaction ve RPC imzasını korur. `review`/`approve` operasyonları geçersiz; `publish` artık ayrı approval durumuna bakmaz. `unpublish`, yalnız aktif yayın snapshot'ını silip `cms_documents` taslağını ve `cms_versions` geçmişini korur.
- **Yetki gevşetilmedi:** `cms_private.allowed(true)` publisher rolü, AAL2 ve veritabanından kontrol edilen aktif oturum gerektirir. Beklenen revizyon ve advisory transaction lock korunur.
- **Medya izni gevşetilmedi:** yayınlandığı anda özel/izinsiz `cms_media` referansları mevcut `cms_public_media_validation` trigger'ıyla reddedilir. Görsel yüklemek veya `save` yapmak otomatik yayın değildir.
- `ContentEditor`: boş "İncelemeye gönder", "Onayla" kaldırıldı. Doğrudan yayımla, onay diyaloglu yayından kaldır, ayrı arşiv işlemi, sürüm geri yükleme. Kirli (kaydedilmemiş) formda yayınlama ve status mutasyonu kapalı.
- `PageEditor` ve içerik detay sayfaları: gerçek `cms_published` snapshot varlığını doğrular, bu yüzden yayında eski sürüm varken kaydedilen yeni taslak yanlışlıkla "yayından kalktı" diye görünmez.
- `/admin` ve `/admin/library`: onay/in-review sayacı yok, gerçek yayın kayıtlarından yayın durumları hesaplanır; taslakla birlikte yayında sürüm ayrımı yapılır.
- `src/app/admin/actions.ts`: sunucu tarafında işlem izin listesi, publisher kontrolü, eski URL/cache invalidation ve sonuç metinleri güncellendi.

## Güvenlik ve yarış koşulları

- Editor rolü içerik kaydeder; publisher rolü olmadan `publish`, `unpublish`, `archive` RPC'lerini çalıştıramaz. Bu ayrım yalnız UI değil SQL tarafında da geçerlidir.
- Tüm işlemler revision kontrolüyle stale tab/revision conflict reddeder; `unpublish` aktif yayın bulunmadığında hata döner.
- `cms_published` salt okunur herkese açık yayın snapshot'larıdır; `cms_documents` taslakları özel kalır.
- SQL'deki eski `approval` kolonu, mevcut veri ve araçlar bozulmasın diye geriye dönük olarak korunmuştur; yeni yayın akışında onay koşulu yoktur. Kolonu silme veya geniş kapsamlı veri dönüşümü yapılmadı.
- Yeni migration **hosted projede çalıştırılmadı**. Gerçek staging'e geçmeden önce schema drift, `cms_published`, `cms_versions`, `cms_audit`, Storage verileri ve rollback kontrolü gerekir. Onaysız / uygunsuz medya asla otomatik public yapılmaz.
- `CMS_PUBLIC_READS` üretim geçiş kapısı korunur. "Yayımlandı" yönetim CMS yayın snapshot'ına alındığı anlamına gelir; halka açık üretim siteye otomatik deploy edildiği anlamına gelmez.

## Kabul

`npm ci`, typecheck, lint, unit test, inventory, snapshot, build, 21 sayfa QA, RLS/AAL1+AAL2 gerçek SQL testleri, anonim taslak/medya erişim engelleri, doğrudan yayın, yayından kaldır/yeni yayın, arşiv ve cache invalidation testleri. Ayrıca yalnız izole Supabase üzerinden eski `review/approve` RPC'lerinin reddedilmesi ve editor rolünün yayın yapamaması doğrulanır.

**Draft / NO-GO:** Beş CI işi başarılı olmadan kod kabulü yok. Staging kurulmadan main merge veya prod GO yok. Sonraki aşama 8: kalıcı güvenlik kontrolleri ve servis yapılandırma denetimi.
