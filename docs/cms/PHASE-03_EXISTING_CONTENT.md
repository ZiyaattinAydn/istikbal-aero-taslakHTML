# İSTİKBAL AEROSPACE — Aşama 3: Mevcut içerikleri tek kaynağa bağlama

**Çalışma branch:** `feat/cms-existing-content-bridge`  
**Bağımlılık:** Aşama 2, `feat/cms-completion-audit` / PR #16 (CI yeşil).  
**Hedef:** Eski URL'leri, 21 sayfa şablonunu, 537 alan anahtarını ve tasarımını bozmadan mevcut haber/proje/platform/teknoloji içeriklerini tekil CMS kayıtlarına hazırlamak.

## 1. Gerçek kaynak envanteri

Orijinal kaynaklar: `src/data/publications.ts`, `src/data/cards.ts`, `src/data/routes.ts`. Aynı konseptin farklı sayfa kartlarında tekrar gösterilmesi, farklı CMS kayıtları oluşturulmasını gerektirmez.

| Kanonik tür | Tekil kayıt | Kaynak |
|---|---:|---|
| Haber / duyuru | 2 | `publicNews` — mevcut `id` alanı |
| Proje / AR-GE | 2 | `publicWorks` — mevcut `id` alanı |
| Platform | 3 | `cards.platform` — benzersiz hedef URL |
| Teknoloji | 6 | `cards.technology` — benzersiz hedef URL; platformlara ait URL'ler aynı platform kaydına yönlendirilir |
| **Toplam** | **13** | `(kind,slug)` birlikte tekil |

**Not:** Teknoloji kartlarında platformlara referans verilen başlıklar (`iha-sistemleri`, `ucus-mimarileri`, `hava-savunma-aglari`) ayrıca teknoloji kayıtları olarak oluşturulmaz. Tekil platform kaydı, aynı hedefin farklı sayfa kartlarında görünen başlık ve açıklamasına öncelik verir.

## 2. Uygulama

1. `src/lib/cms/legacy-content.ts`: Sabit kimlikler, kayıt kaynağı, slug, eski URL, kayıt verisi, alan-anahtarı eşleştirmeleri; yayınlanmış mevcut içeriği eski kartın yerine yerleştiren **saf** yardımcılar.
2. `src/lib/cms/legacy-public.ts`: Yalnız `cms_published` içinden alınan public snapshot'ları okuyan, tür başına cache'li ve public CMS erişimi kapalıyken sıfır ek sorgu yapan katman.
3. `src/app/page.tsx` ve `src/app/[slug]/page.tsx`: CMS'de yayımlanan mevcut içerikleri eski kartlara yansıtır; hiçbir eski `.html` bağlantısını silmez. CMS kapalı/yayın yoksa aynı statik içerik görünür.
4. `src/components/pages/PublishedCards.tsx`: Mevcut 13 kanonik içerik, yeni ikinci kart olarak *eklenmez*. Yalnız gerçekten yeni CMS içerikleri ilgili bölümün sonunda listelenir.
5. `scripts/cms/existing-content-seed.ts`: Salt-okunur özet veya operatörün yerel makinesinde `--write` ile oluşturulan idempotent SQL. Mevcut `(kind,slug)` kayıtlarını **ASLA UPDATE etmez**. SQL otomatik veya canlı Supabase'e uygulanmaz.
6. `tests/cms-existing-content.test.ts`: 13 kimliğin tekilliği, 21 sayfa/537 alan, yerinde güncelleme, URL korunması, yanlış slug ve kopya önleme regresyon testleri.

## 3. Aşama 3 operasyon sırası — emniyet kapıları

1. PR'da `typecheck`, `lint`, `test`, `cms:inventory:check`, `cms:snapshots:check`, `cms:pages:check`, `build`, tarayıcı, performance ve local-auth testleri başarılı olsun.
2. Hosted migration ledger ve kaynak SQL hash/drift farkını çöz. Doğrulanmış DB yedeği ve rollback provası olmadan seed uygulama.
3. İzole staging DB'de `node --import tsx scripts/cms/existing-content-seed.ts --write` çalıştır, oluşan SQL'yi incele; **yalnız kontrollü staging ortamında** uygula.
4. Dry run sonrası 13 benzersiz `(kind,slug)` kaydının varlığını; tekrarlı çalışma sonrası toplamın değişmediğini; mevcut 21 sayfa / 537 alan ve sürümlerin değişmediğini doğrula.
5. İlk yayın testini izole staging'de gerçekleştir: mevcut bir haber veya platform kaydını düzenle → yayınla → yalnız *orijinal kart* güncellenmiş görünür, ikinci kart oluşmaz → eski URL çalışmaya devam eder.
6. Medya dosyası yükseltmesini 5. aşamada gerçekleştir; statik resim dosyalarını bu seed'de gereksiz yere DB'ye kopyalama. `cover_id` yoksa mevcut statik görsel kullanılmaya devam eder.
7. Kullanıcı kabulü ve Cloudflare staging testi olmadan production GO yoktur.

## 4. Bilinen tasarım borcu ve sonraki işler

- **Aşama 4:** Yönetici sayfa editöründe kanonik karta ait eski alanları ikinci kez yazılabilir metin olarak göstermek yerine ilgili CMS kaydına yönlendiren anlaşılır 'İçeriği düzenle' deneyimi. Veri alanları ve geçmişi silinmeyecek.
- **Aşama 5:** Mevcut görsellerin birleşik medya kütüphanesinde gösterilmesi ve editörden güvenli upload.
- **Aşama 6:** Görsel editörde deterministik `data-cms-field` eşleştirme ve bölünmüş ekran/tam ekran tutarlılığı.
- **Aşama 7:** CEO rolü için doğrudan yayın ve ayrı `unpublish` işlemi, RLS/AAL2 ve atomic transaction testleri.
- **Aşama 8-10:** Güvenlik, regresyon, tarayıcı, performans ve Cloudflare kabulü.
- İçeriklerin yayından kaldırılması mevcut eski statik karta otomatik sıfır içerik üretmez. Üretimde listeleme/hide lifecycle davranışı ayrıca tasarlanıp kabul edilmelidir. Bu aşama yalnız **publish overlay** sağlar.

**Dağıtım:** Yapılmadı. **Supabase/Cloudflare/main veri değişikliği:** Yapılmadı. **Merge:** Beklemede, draft.
