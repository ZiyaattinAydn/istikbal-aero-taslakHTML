# İSTİKBAL AEROSPACE — CMS Aşama 1: Kod, Veri ve Yayın Denetimi

**Tarih:** 12 Kasım 2026  
**Karar:** NO-GO (son kullanıcı kabulü, tüm testler ve kontrollü staging doğrulaması tamamlanmadı)  
**Kaynak commit:** `828033e6f07a95636916fe3a980df6e9c8cd8369` (`feat/cms-visual-preview`, PR #15)  
**Denetim dalı:** `feat/cms-completion-audit`  
**Kapsam:** PR #13/#14/#15, 21 kurumsal route, 537 CMS alanı, içerik/medya modelleri, erişim ve yayın akışı.

## 1. İnceleme yöntemi ve sınırlar

GitHub bağlantısından PR metadata, dosya listeleri, güncel committeki uygulama kaynakları, testler, rota ve alan envanteri okundu. Supabase bağlantısından **salt okunur** tablo şeması, satır sayıları, RLS politikaları, fonksiyon tanımları, migration geçmişi ve advisor sonuçları incelendi. Veritabanı, canlı içerik, DNS, domain ve Cloudflare dağıtımı **değiştirilmedi**. Bu oturumda kodu container'a klonlamak veya `npm ci`/build/Playwright çalıştırmak mümkün olmadı; geçmiş CI kanıtı yeni doğrulama yerine konulmamalıdır. Gerçek kullanıcı oturumuyla tarayıcı testi gerçekleştirilmedi.

PR zinciri: `main` <- #13 `feat/cms-foundation` <- #14 `feat/cms-admin-experience` <- #15 `feat/cms-visual-preview`. Üç PR açık ve draft. Son iki PR için Vercel commit status `success`; aynı commitlerde GitHub Actions PR workflow çalışması bağlantıdan dönmedi. PR #13'ün son commitinde Migration QA ve CodeQL `success` geçmiş kanıtı var. PR #15'teki iframe header istisnası için unit test mevcut, ancak Cloudflare staging üzerinde tarayıcı doğrulaması yapılmadı.

## 2. Canlı Supabase envanteri

| Tablo | Satır | RLS | Not |
|---|---:|---|---|
| `cms_roles` | 1 | açık | 1 aktif `publisher` |
| `cms_documents` | 21 | açık | yalnız `page`, tümü `draft`/`unreviewed` |
| `cms_page_fields` | 537 | açık | 444 text, 43 image, 50 link |
| `cms_versions` | 21 | açık | mevcut seed sürümleri |
| `cms_published` | 0 | açık | canlı CMS snapshot yok |
| `cms_media` | 0 | açık | CMS yüklenen görsel yok |
| `cms_relations` | 0 | açık | yapılandırılmış içerik ilişkisi yok |
| `cms_audit` | 0 | açık | hosted kullanıcı işlemi/audit henüz yok |

`auth.users` içinde 1 kayıt görüldü; eski #13 dokümanındaki '0 kullanıcı' ifadesi güncel değil. Kullanıcı bilgileri rapora eklenmedi.

**537 alan dağılımı:** `Metin` 189, `Başlık` 101, `Açıklama` 92, `Bağlantı` 48, diğer etiketler 107. Bu sayılar alanların varlığını doğrular; tamamının kullanıcı açısından anlamlı etiketlendiğini veya tarayıcıda doğru DOM konumuyla eşleştiğini kanıtlamaz.

**Medya:** `public/assets` içinde 9 dosya: favicon + 8 görsel. Mevcut medya listesi yalnız `cms_media` kaydı okur; tüm mevcut statik görseller görünmez. `cms-media` bucket private ve 5 MiB sınırına sahiptir.

**Migration kaydı:** GitHub'daki beş SQL migration kaynak dosyasının timestamp'leri ile hosted `supabase_migrations` geçmişindeki beş uygulama timestamp'i **aynı değil**. Migration isimleri/sıraları aynı görünüyor, ancak kaynak ile hosted sürümün birebir hash eşitliği bu incelemede kanıtlanmadı. `supabase db push` veya migration tekrar uygulaması öncesi drift/ledger uzlaştırması zorunlu.

## 3. Öncelikli bulgular

### P0 — Kabul engelleri

1. **İki ayrı onay kapısı hâlâ var.** `src/components/admin/ContentEditor.tsx` doğrudan 'İncelemeye gönder' ve 'İçeriği onayla' düğmeleri sunuyor; `src/app/admin/actions.ts` `review/approve` çağırıyor. Hosted `cms_private.mutate` içinde `publish`, `approval='approved'` gerektiriyor. Yalnızca buton kaldırmak işlevi bozacaktır. Yetkili `publisher` için doğrudan yayın, atomic RPC ve testlerle uygulanmalı.

2. **Mevcut içeriklerin tek kaynağa bağlanması bitmedi.** Hosted `cms_documents` sadece 21 sayfadan oluşuyor; ayrı haber, proje, platform, teknoloji yok. `src/data/cards.ts` ve diğer statik koleksiyonlar hâlâ kullanılıyor. `src/components/pages/PublishedCards.tsx` CMS yayınlarını mevcut sayfaların sonuna ayrıca ekliyor. Mevcut şirket içeriği seed edildiğinde çift kart/görünüm riski var. Doğrulanmış özgün kimlik/slug eşlemesi ve idempotent geçiş gerekli.

3. **Medya iş akışı eksik.** `src/app/admin/media/page.tsx` yalnız DB medyayı gösteriyor. `PageEditor.tsx` image alanlarında `select` kullanıyor; doğrudan yükleme yok. Statik 8 görsel seçilebilir/aranabilir birleşik kütüphanede gösterilmiyor. Upload işlemi yalnız medya ekranında mevcut.

4. **Son kullanıcı kabulü tamamlanmadı.** #14/#15 Vercel durumları başarılı olsa da gerçek Cloudflare iframe/OTP/TOTP/refresh/logout/upload/CRUD ve mobil kabulü bu denetimde doğrulanmadı; staging'e otomatik dağıtım yapılmamalı.

### P1 — Kullanılabilirlik ve mimari

5. **Alanlar semantik olarak gruplanmamış.** `src/data/cms-page-schema.json` ve `pageData` mekanizması jenerik etiketler üretiyor; `PageEditor.tsx` görünür alanları `{index + 1}. {field.label}` olarak sıralıyor. Kullanıcı '18. Metin' ve '31. Bağlantı' görüyor. Uzun parçalı cümleler ayrı alanlarda kalıyor. UI'da bölüm/kart bazlı blok modeline geçilirken mevcut key/value/snapshot korunmalı.

6. **Web sayfalarında kategori/arama birleşimi yetersiz.** `src/app/admin/pages/page.tsx` 21 kartı düz listeliyor. `src/data/navigation.ts` ana menü ve alt menü bilgilerini sağlıyor ama yönetim filtresine bağlanmamış.

7. **Görsel konumlama güvenilir değil.** `PagePreviewBridge.tsx` `TreeWalker` ve metin değeri/eşleşme ile DOM hedefi arıyor. Tekrarlayan/kısa metinler yanlış hedefle eşleşebilir; stable `data-cms-field` kapsaması tüm 537 alan için kanıtlanmadı. Kaydedilmemiş değişiklikler sağdaki iframe'e gönderiliyor ancak 'Tam sayfa önizle' ayrı sekmede yalnız sunucudaki kayıtlı taslağı açıyor. Gerçek tarayıcı regresyonu gerekli.

8. **Yayından kaldırma, arşivlemeden ayrı değil.** RPC mevcut `archive` ile snapshot siliyor ve `archived` durumuna alıyor. İstenen açık 'Yayından kaldır' işlevi için uygun lifecycle ve metinler ayrıca tasarlanmalı; sürümler kaybolmamalı.

9. **Sayfa linkleri textarea olarak düzenleniyor.** `PageEditor.tsx` image dışı türleri (text + link) aynı textarea ile sunuyor; URL girişine özgü doğrulama/öneriler ve anlaşılır kaynak/rota seçimi yok.

10. **Hosted migration geçmişi kaynak dosyalarla reconcile edilmeli.** Ledger timestamp farkı, ileride yinelenen DDL denemesi veya drift raporu riski yaratır. Mevcut beş migration tekrar çalıştırılmamalı.

### P2 — İzleme ve operasyon

11. **Supabase security advisor bir `auth_leaked_password_protection` uyarısı döndürdü.** Giriş modeli parolasız OTP olduğu için doğrudan doğrulanmış bir sömürü açıklığı değildir; mevcut auth ayarları/kapsamı not edilmeli. Performance advisor beş 'unused index' bildirimi döndürdü; tablolar büyük ölçüde boşken indeks silinmemeli.
12. **Statik içeriklerin tam kapsamı doğrulanmalı.** 21 route ve 537 kontrollü alan var; ancak site kabuğu, ortak footer/header ve bütün görünen text/link/image örneklerinin kapsanması ayrıca alan-karşılığı envanter testi gerektiriyor.

## 4. Korunacak güvenlik özellikleri

- `requireAdmin()`: `auth.getUser()`, aktif rol denetimi ve MFA `aal2`.
- `cms_private.allowed()`: `auth.uid()`, JWT `aal2`, aktif `cms_roles` ve `auth.sessions` varlığı.
- Public şemadaki yazma giriş noktası `cms_mutate` security invoker; ayrı private definer içeriden izin denetliyor. Doğrudan tablo yazması genel istemci için RLS/grant ile kapalı.
- `cms_published` snapshot'ı taslaktan ayrı; cache invalidation mekanizması var.
- Private medya bucketi; medya görünürlüğü/izin geri çekme için özel RPC ve referans/atomiklik koruması.
- OTP, QR/TOTP, SSR cookie/session, kullanıcı başına rol ayrımı ve `no-store` önizleme.
- Mevcut URL/slug ve 21 sayfa tasarımı, CSS/animasyonlar, tüm eski sürümler ve kayıtlar.

Not: Bunlar statik kod/şema ile doğrulanmış tasarım kontrolleridir; gerçek AAL1/anon/rol iptali bypass testlerinin bu turda yeniden çalıştırıldığı anlamına gelmez.

## 5. Aşama 2 teknik uygulama planı

1. **Sabit sayfa/kayıt kimliği:** 21 route ve 537 alan key'ini değişmez kimlik olarak koru. UI görünüm tanımlarını `pageSections` gibi türlenmiş registry'de grup/bölüm/kart/kısa açıklama ile eşleştir. DB `fallback` ve `body.fields` değerlerine dokunma.
2. **Semantik bölüm tasarımı:** `Hero`, `Giriş`, `Teknoloji Kartları`, `Projeler`, `Haberler`, `Footer` vb. sayfaya uygun gruplar oluştur; tekrarlı inline parçalar için güvenli birleşik düzenleme görünümü tasarla, kontrollü inputlara geri ayrıştır. Son kullanıcıya sayı, `.html`, ham key gösterme.
3. **Navigasyon tek kaynaktan:** `navigation.ts`, `platformLinks`, `technologyLinks` ve `routes` bilgilerini admin sayfa filtresine dönüştür. Alt menüler ve Türkçe normalizasyonlu arama uygula; her kategori toplamı/aktif filtre test edilsin.
4. **Mevcut içerik kimlik eşlemesi:** Haber, proje, platform ve teknoloji için statik `cards.ts`/`publications.ts` ve ilgili sayfa verilerini canonical ID/slug düzeyinde haritala. Ayrı içerik migrasyonu aşama 3'te **idempotent upsert**, dry-run ve çakışma raporuyla gerçekleştirilsin; bugünkü statik sayfalar bozulmasın.
5. **Medya envanteri tasarımı:** Statik dosyalar `origin='static'` read-only sanal kayıt olarak, CMS yüklemeleri `origin='uploaded'` olarak aynı UI'da gösterilsin; mevcut binaryleri gereksiz yere yeniden Supabase'e yükleme. Editörden doğrudan upload için izinli WebP conversion + alt/telif + private storage + metadata + geri kazanım akışı tasarla.
6. **Yayın lifecycle geçişi:** Yetkili `publisher` için doğrudan `publish`, ayrı `unpublish`, `save`, `restore` sözleşmesini yeni migration ile güncelle. Eski `approval` sütunlarını veri kaybı yaratacak şekilde hemen DROP etme. Medya hakları/AAL2/aktif rol/revision/transaction koşullarını koru.
7. **Önizleme sözleşmesi:** 537 alan için deterministik DOM marker envanteri; iframe güvenli mesajlaşma, seçim/focus, split-screen, tam ekran aynı kirli taslak görünümü ve tablet/mobil geçiş kuralları.
8. **İleri aşama gate'leri:** Önce yeni branch'te test+lint+typecheck+build, SQL/PGlite lifecycle/rls, 21/537 field envanteri, gerçek tarayıcı E2E. Sonra kontrollü Cloudflare staging; company domain/production kesinlikle sonraya.

## 6. Kabul ölçütleri ve test kapıları

- Tüm 21 sayfa açılır; 537/537 field key'i korunur, aynı varsayılan render bozulmaz, her alan doğru görsel hedefle eşleşir veya açık, test edilen fallback sunar.
- En az bir örnek her türde: text/link/image değiştir → kirli taslak preview → kaydet → tam sayfa preview → doğrudan yayın → genel sitede görün → yayından kaldır → son sürümü geri yükle.
- Haber, proje, platform ve teknoloji ana kartları hiçbir örnekte iki kez listelenmez; legacy route/SEO/anchor davranışı korunur.
- Statik 8 görsel birleşik kütüphanede görünür; editörden yeni dosya yüklemesi works; private/anon/copy/revoke ve yayın referansları test edilir.
- Anonymous, MFA'sız AAL1, pasif rol, iptal edilmiş session, stale revision ve yasak medya için edit/publish reddedilir. Publisher için gereksiz approval zorunluluğu olmaz.
- Mobile/split/fullscreen iframe katmanları çakışmaz; bağlantı/klavye/focus/a11y regressions kontrol edilir.
- Database/Storage backup, rollback ve migration ledger drift kontrolü yapılmadan hosted schema değişikliği uygulanmaz.
- `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, ilgili CMS envanter ve browser testleri yeniden çalıştırılır; gerçek sonuçlar rapora eklenir.

## 7. Aşama 1 sonucu

**Denetim ve teknik plan dokümante edildi.** Gerçek kullanıcı/browser, hosted Auth/Resend ve Cloudflare kabulü doğrulanmadığından CMS tamamlanmış veya üretime hazır değildir. Bu commit rapor dokümanıdır; hiçbir uygulama kodu, seed, migration, altyapı veya canlı veri değiştirilmemiştir.
