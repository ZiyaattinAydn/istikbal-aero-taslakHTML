# İSTİKBAL AEROSPACE — 6. Aşama: Güvenilir görsel önizleme

**Branch:** `feat/cms-deterministic-preview`  
**Base:** `feat/cms-unified-media-library` / PR #19  
**Durum:** Kod ve otomatik testler; gerçek Cloudflare staging kabulü ayrıca gereklidir.

## Amaç

İşaretlenmek istenen alanın yanlış kart veya cümlede bulunması, kaydedilmemiş metnin ayrı sekmede görünmemesi ve tekrar eden görsellerde yanlış nesnenin seçilmesi gibi hataları azaltmak. 21 sayfa / 537 alan anahtarı, SEO URL'leri, içerik kayıtları, MFA/RLS güvenliği ve animasyonlar korunur.

## Uygulama

1. `src/lib/cms/preview-matching.ts`: Metin, görsel ve bağlantı için **tam ve tekil eşleşme**. Alt dize tahmini kaldırıldı; `ile` gibi kısa bir sözcüğün başka cümleye bağlanması veya birbirine benzeyen görsellerin karıştırılması engellenir.
2. `PagePreviewBridge.tsx`: Mevcut sayfa üzerindeki `data-cms-field` işaretleri öncelikli. İşaret yoksa yalnız benzersiz tam eşleşme kullanılır. Eşleşme belirsizse yanlış yeri düzenlemek yerine anlaşılır açıklama verilir. İletişim yalnız aynı origin ve doğrulanmış iframe kaynağıyla yapılır.
3. `HomeContent` / `AboutContent`: Tekrarlı kullanılan dört görsele açık alan işareti. Kullanıcı arayüzünün düzeni, mevcut medya URL'leri veya özgün dosyalar değişmez.
4. `PageEditor.tsx`: Aynı korumalı iframe'i kullanarak **canlı tam ekran**. Kaydedilmemiş değişiklikler tam ekranda da görünür. Escape ile kapanır; tarayıcı kaydırması yalnız tam ekran boyunca kilitlenir.
5. Ayrı sekmede açılan önizlemenin adı **Kaydedilmiş taslağı yeni sekmede aç** olarak düzeltildi. Böylece henüz kaydedilmemiş değişiklikler için yanlış beklenti yaratılmaz.
6. `tests/cms-preview-matching.test.ts`: Aynı metin, kısa metin, benzer görsel adı, farklı URL ve güvenli protokol testleri.
7. `scripts/cms/ui-auth.mjs`: Gerçek yerel AAL2 oturumunda kaydedilmemiş başlık düzenleme, iframe/tam ekran güncellemesi, kaydetmeden DB'nin değişmemesi, Escape ve kesin görsel işareti testi.

## Bilinçli sınırlamalar

- Uygulamada tüm 537 alan için özgül DOM işareti henüz yoktur. **Belirsiz alanlar için yanlış eşleştirme yapılmaz**; kullanıcı alanı sol editörden değiştirebilir. İhtiyaç halinde ek işaretler sayfa bazlı artırılabilir.
- Önizleme, mevcut React DOM'undaki metin düğümlerini güvenli biçimde geçici olarak günceller. İki farklı düğüme bölünmüş, tekil olmayan veya başka bileşenlerce yönetilen karmaşık metinlerde anlık güncelleme kısıtlı olabilir; taslak kaydı ve gerçek sayfa oluşturma korunur.
- HTML içerik enjeksiyonu kullanılmaz; bağlantılar önizleme denetiminde takip edilmez. Yüklenen özel görsellerin mevcut AAL2 izinleri korunur.
- Bağımsız yeni sekme **kaydedilmiş** veritabanı taslağını açar; canlı, kaydedilmemiş tam ekran için mevcut editördeki **Tam ekran** düğmesi kullanılır.
- RLS, Auth, SMTP, Supabase migration, Storage bucket izinleri, main ve Cloudflare staging değiştirilmedi.

## Kabul kriterleri

GitHub Actions içinde typecheck, lint, unit testleri, 21 sayfa/537 alan şeması, envanter, snapshot, build, production/development browser, performans ve yerel OTP/TOTP/RLS/Storage/UI testleri geçmelidir. İşaret eklenen Home ve About sayfalarının kaynak envanteri ile sayfa HTML snapshot değişiklikleri açıkça karşılaştırılmalı ve sadece beklenen farklar kabul edilmelidir.

Tamamı yeşil olsa bile **PR draft/NO-GO** kalır; gerçek Cloudflare staging ve CEO kullanıcı kabulü yapılmadan üretim ortamına aktarılmaz. 7. aşama doğrudan yayın/yayından kaldırma işlemidir.
