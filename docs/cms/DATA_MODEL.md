# Veri modeli — devam çalışması

Dört migration yalnız yeni bağımsız Supabase Free projesine uygulandı. SQL senaryoları ayrıca PGlite üzerinde çalışır; o testte Auth işlevleri fixture'dır. Gerçek Auth/PostgREST/Storage için CLI/Mailpit CI 43067794522'de 15 kontrol geçti. Hosted Auth/API kabulü bunun yerine geçmez.

| Tablo | Amaç / erişim |
|---|---|
| cms_roles | Editör/yayıncı ve anlık iptal. Kullanıcı kendi rolünü okur; rol yazamaz. |
| cms_documents | Kontrollü gövde, tür, sabit slug, durum, ayrı onay, revision. Aktif AAL2 ekip ve geçerli oturum gerekir. |
| cms_published | Onaylı public snapshot; taslak sorgusu kullanılmaz. Uygulama bağlantısı hazır, varsayılan kapalı. |
| cms_versions | Değişmeyen snapshot; geri alma yeni onaysız taslak üretir. |
| cms_audit | Aktör/zaman/işlem; istemci doğrudan değiştiremez. |
| cms_relations | Taslak gövdesindeki versioned related_ids ile transaction içinde eşlenen ilişki/indeks. Doğrudan istemci yazması yok. |
| cms_page_fields | 21 sayfa / 537 izinli metin, görsel ve link alanı; kullanıcı şema yazamaz. |
| cms_media | Boyut, MIME, alt metin, telif izni, private/public. Oluşturan kimliği anon sorguya açık değil. |
| cms_private.admin_allowlist | Yalnız operatörün eriştiği e-posta listesi; public API şeması değil. |

Gövde başlık (160), özet (1.000), en fazla 30 düz metin paragrafı (8.000), nullable tarih/kaynak/aşamadır. Sayfalardaki ek `fields` anahtarları kayıtlı şemaya göre doğrulanır. Serbest HTML/CSS yok. Onay `unreviewed/in_review/approved`; durum `draft/in_review/approved/published/archived`; ürün olgunluğu ayrı stage alanıdır.

İçerik yazmaları `cms_mutate` üzerinden kilitli transaction'a gider. Public wrapper SECURITY INVOKER; özel definer fonksiyon her çağrıda aktif rol, AAL2 ve mevcut auth.sessions kaydını doğrular. PUBLIC execute kaldırılmıştır. Bütün CMS tabloları RLS kullanır. Anon yalnız snapshot ve public kullanımına izin verilen medya alanlarını okur. Hosted security advisors temizdir.

Kaydetme/geri alma revision artırır, onayı sıfırlar. Yayın onay/yayıncı rolü ister. Eski revision reddedilir. Arşiv snapshot'ı kaldırır, audit/versions korunur. Sayfa oluşturma UI/RPC'den yasaktır; reviewed seed gerekir. Yayın trigger'ı özel/onaysız medya referansını reddeder. Private Storage okuması metadata görünürlüğüne bağlıdır.

`page-seed.sql` izinli alanları günceller; revision=1 şemasız eski fixture'lara alanları ekler. Düzenlenmiş metni silmez. Tekrarlı seed, düzenleme ve tekrar seed korunumu test edilir. Şirket iddiaları otomatik yayımlanmaz. Panel son 30 sürümü listeler; retention silmesi yoktur.

Create sabit işlem kimliği taşır: aynı tekrar aynı kaydı döndürür, farklı veri conflict üretir; ikinci kayıt/audit oluşmaz. Başlık düzenlemesi URL'yi değiştirmez. İlişki UI/public kartları eklendi; public sorgu yalnız cms_published hedeflerini döndürür. Mevcut statik ilişkiler korunur.

## Lifecycle uzantısı (hosted uygulandı)

Gövdeye optional cover_id ve related_ids eklendi. UUID, tür, mevcut hedef, mükerrerlik, kendine ilişki ve 12 hedef limiti DB trigger'ıyla denetlenir. Restore kapağı ve ilişkileri birlikte geri alır. Medya caption özel kullanım notudur; revision ile eski oturum yazması reddedilir. Doğrudan visibility UPDATE grant'i kaldırılır, cms_manage_media rol/AAL2/session ve revision kontrolü yapar.

Yayın ile izin geri çekme aynı advisory transaction kilidiyle seri çalışır; onaysız görsel sonradan yayın snapshot'ına giremez. İzin geri çekme onaylandığında bağlı snapshot'lar kaldırılır, taslak/onay durumu sıfırlanır ve audit yazılır. Dosya ve sürümler korunur. Public dosya route'u no-store'dur; önceden indirilmiş kopya geri çağrılamaz.
