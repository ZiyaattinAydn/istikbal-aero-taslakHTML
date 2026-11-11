# Veri modeli ve taşıma sınırı

`supabase/migrations/*_cms_foundation.sql` yalnızca yerel PostgreSQL uyumlu PGlite motorunda çalıştırıldı. Hosted Supabase'e uygulanmadı. PGlite testi Auth servisinin veya PostgREST'in gerçek testi değildir; `auth.uid`, `auth.jwt`, kullanıcı ve oturum tabloları fixture'dır.

| Tablo | Amaç / erişim |
|---|---|
| cms_roles | Kullanıcı başına editör/yayıncı, anlık erişim iptali. Kullanıcı yalnız kendi rolünü okur; rol yazamaz. |
| cms_documents | Kontrollü metin gövdesi, tür, sabit otomatik slug, çalışma durumu, ayrı onay, revision. Yalnız aktif, AAL2, geçerli oturumlu ekip okur. |
| cms_published | Kamuya açık tek snapshot. Taslak alanlarını içermez. Public uygulamaya henüz bağlanmadı. |
| cms_versions | Değişmeyen metin snapshot'ları; geri alma yeni ve onaysız taslak üretir. |
| cms_audit | Kim/ne zaman/hangi işlem; istemci doğrudan değiştiremez. |
| cms_relations | Kayıt ilişkileri için temel tablo/indeks; yazma ve UI henüz açılmadı. |

`body`: başlık (160), özet (1.000), en fazla 30 düz metin paragrafı (8.000), bilinmiyorsa null tarih/kaynak/aşama. Sayfa fixture'ları tam kontrollü bölüm şeması değildir. Onay `unreviewed/in_review/approved`; çalışma durumu `draft/in_review/approved/published/archived`; ürün olgunluğu ayrı `stage` alanındadır.

Tüm yazmalar açık tablo grant'i yerine `cms_mutate` üzerinden kilitli transaction'a gider. Public wrapper SECURITY INVOKER; özel şemadaki dar definer fonksiyon her çağrıda aktif rol, AAL2 ve mevcut `auth.sessions` kaydını doğrular. Varsayılan PUBLIC execute kaldırılmıştır. Public/private bütün tablolar RLS kullanır; anon yalnız yayın snapshot'ını okur. Hosted projede advisors ve API schema exposure ayrıca kontrol edilmelidir.

Kaydetme ve geri alma revision artırır, onayı sıfırlar. Yayın onay ve yayıncı rolü ister. Aynı revision ile eski oturumdan kaydetme reddedilir. Arşiv yayın snapshot'ını kaldırır, audit/versions korunur. Sayfa oluşturma UI/RPC'den yasaktır; yalnız reviewed seed. Tabloları geniş metadata/page builder deposuna dönüştürmeyin; bölüm şemaları gerçek şablonlara eşlenmeden public okumayı açmayın.

Seed tekrarında `(kind,slug)` çakışması mevcut metni değiştirmez. Test iki kez seed + düzenleme + yeniden seed sonrası 21 sayfayı ve düzenlenmiş metni doğrular. Seed'deki mevcut şirket iddiaları otomatik onaylanmaz/yayımlanmaz. `cms_versions` son 30 sürümü panelde listeler; silme/retention henüz yoktur.
