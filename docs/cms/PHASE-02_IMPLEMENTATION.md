# CMS — Aşama 2: İçerik organizasyonu ve navigasyon uygulaması

**Branch:** `feat/cms-completion-audit`  
**PR:** [#16](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/16), draft, base `feat/cms-visual-preview`  
**Hedef:** 21 sayfanın kullanıcı dostu düzenlenmesi için 537 mevcut alanı kayıp olmadan gruplayıp yönetici navigasyonunu yenilemek.  
**Durum:** Kod uygulandı; CI/gerçek tarayıcı kabulü başarıyla tamamlanmadan kabul edilmez.

## Uygulanan değişiklikler

1. `src/lib/cms/page-organization.ts` — public `navigation`, `platformLinks`, `technologyLinks` ve `routes` temelinde kategori/alt menü kaydı. Sayfa alanı anahtarları **değiştirilmeden** alanların görsel grupları oluşturulur.
2. `src/components/admin/PageBrowser.tsx` ve `src/app/admin/pages/page.tsx` — 21 sayfa için üst kategori, alt menü, Türkçe arama ve sonuç sayacı. URL/slug korunur.
3. `src/components/admin/PageEditor.tsx` — ham alan sıra numaralarının yerini mantıklı, katlanabilir bölümler ve kartlar aldı; resim/link/metin türlerine göre kontroller ayrıldı. Mevcut 537 alan `savePage` üzerinden aynı JSON `fields` anahtarlarıyla kaydedilmeye devam ediyor.
4. `src/components/admin/PageLinkField.tsx` — site içi hedefler insan adlarıyla seçilir; `.html` dosya isimleri kullanıcıya seçenek etiketi olarak gösterilmez. Dış HTTPS, e-posta ve telefon adresleri ayrı kontrollerde düzenlenir.
5. `src/app/admin/style.css` — responsive, erişilebilir kategori çubuğu, alt menüler ve içerik blokları.
6. `tests/cms-page-organization.test.ts` — 21 route kategori eşlemesi, 537 anahtar/tür/değer bütünlüğü, kart grupları, Türkçe arama ve bağlantı seçici testleri.
7. `scripts/cms/ui-auth.mjs` — gerçek admin UI testleri katlanabilir bloğu açarak kayıt/önizleme/yayın sürüm akışını denetler; güvenlik koşulları değiştirilmez.
8. CI çalışması için `.github/workflows/qa.yml` stacked CMS PR'larında kontrol yapılacak şekilde genişletildi. Lint engelleyicileri: dahili sayfa bağlantıları Next `Link` kullanır; MFA yeni cihaz doğrulaması sonrası UI temizliği hook effect yerine başarılı action callback'inde yapılır.

## Veri bütünlüğü ve sınırlar

- PostgreSQL migration, Supabase verisi, RLS, Auth, MFA, private Storage, yayınlama RPC, public URL, sayfa şablonları, CSS/motion veya Cloudflare staging **değiştirilmedi**.
- 21 sayfa/537 alanın kaydedilmiş `key`, `kind`, `fallback` ve `body.fields` değerleri değişmez. Görsel grup haritası yalnız presentation katmanıdır; geriye dönüş için uygulama diff'ini revert etmek yeterlidir.
- Uzun cümlelerin birden fazla DOM metin düğümüne bölünmesi ve canlı iframe konum eşleştirme güvenilirliği bu fazda değiştirilmedi. Deterministik target marker denetimi 6. aşamada kalır.
- Mevcut statik görsellerin medya kütüphanesine eklenmesi ve doğrudan upload 5. aşamadadır.
- Statik haber/proje/platform/teknolojinin canonical CMS kayıtlarına tekilleştirilmesi 3. aşamadadır.
- `review/approve` basamaklarının kaldırılması ve `unpublish` işlemi 7. aşamada DB transaction, güvenlik ve regresyon testi gerektirir.

## Doğrulama kapıları

Aşağıdaki komutlar yeni PR'nin GitHub Actions çalışmasında başarısızlıklar gizlenmeden değerlendirilmelidir:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run cms:inventory:check
npm run cms:snapshots:check
npm run cms:seed:check
npm run cms:pages:check
npm run build
npm run test:browser
npm run cms:test:auth
```

Ayrıca Cloudflare staging üzerinde görsel inceleme ve CEO kullanıcı kabulü olmadan **üretim GO yoktur**. Sonuçlar ve varsa açık hatalar [PR #16 Actions](https://github.com/ZiyaattinAydn/istikbal-aerospace-web/pull/16/checks) üzerinden takip edilir. Kırmızı test varken faz bitmiş sayılmaz.
