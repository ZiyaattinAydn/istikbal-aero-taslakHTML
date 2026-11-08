# İstikbal Aerospace — Yayına Hazır İçerik Teslim Şablonu

**Amaç:** Platform, ürün, AR-GE projesi, mühendislik kabiliyeti ve haber içeriklerini birbirine karıştırmadan toplamak. Bu belge içerik giriş şablonudur; canlı CMS henüz kurulmuş değildir.

## 1. Önce içerik türünü seçin

| İçerik türü | Ne zaman seçilmeli? | Sitedeki karşılığı |
|---|---|---|
| **Platform / Ürün** | Somut cihaz, fiziksel platform, alt sistem veya bağımsız yazılım ürünü varsa | `platformlar.html` ve gerektiğinde ürün detayları |
| **Proje / AR-GE** | Belirli hedefi, sorumlusu ve geliştirme aşaması olan çalışma varsa | `projeler.html` ve onaylı proje detayları |
| **Teknoloji / Kabiliyet** | Şirketin çalıştığı teknik alan veya doğrulanabilir mühendislik yeteneği varsa | `teknolojiler.html`, `kabiliyetler.html` ve teknik detaylar |
| **Haber / Duyuru** | Tarihi belli paylaşım, gelişme, iş birliği, tanıtım ya da etkinlik varsa | `haberler.html` ve haber detayları |

Bir proje aynı anda bir ürün geliştirebilir, birden fazla teknoloji kullanabilir ve hakkında birden fazla haber yayımlanabilir. **Veri ayrı kayıtlarda tutulmalı; ilişkileri kimliklerle bağlanmalıdır.**

## 2. Abdullah'ın her içerik için vereceği bilgiler

Aşağıdaki alanlar mümkün olduğunca eksiksiz doldurulmalı:

- **İçerik türü:** Platform / Ürün / Proje / AR-GE / Teknoloji / Kabiliyet / Haber
- **Resmî başlık ve kısa ad:** 
- **Ziyaretçiye yönelik 1–2 cümlelik açıklama:**
- **Ayrıntılı açıklama / teknik kapsam:** Yalnızca yayımlanmasına izin verilen bilgiler
- **Geliştirme durumu:** Konsept / araştırma / tasarım / prototip / test / üretim / faal. *Yalnızca gerçekte geçerliyse*.
- **Gerçek başlangıç, test veya yayın tarihi:** Bilinmiyorsa boş bırakılmalı
- **İlişkili ürünler ve projeler:**
- **İlişkili teknolojiler / kabiliyetler:**
- **Fotoğraf, video, çizim veya PDF:** Dosya, alt metin ve yayın izni
- **Orijinal paylaşım veya kaynak adresi:**
- **Açıklanması yasak/gizli bilgiler:** Kamuya açık siteye aktarılmamalı
- **Yayın yetkilisi ve onay tarihi:**
- **Kayıt durumu:** Taslak / İncelemede / Onaylı / Yayında

## 3. Teknik özellik ve medya onayı

Performans, menzil, hız, uçuş süresi, seri üretim, operasyonel kullanım, test sonucu, müşteri kurumu veya sertifikasyon gibi ifadeler **kanıt ve yetkili onay olmadan yayımlanmamalıdır**. Teknik detayın kaydı ile herkesin görebileceği teknik detay aynı şey değildir. Hassas veya gizli teknik veri hiçbir zaman genel site içeriğine eklenmemelidir.

Temsili görsel kullanılıyorsa bu durum yanıltıcı olmayacak şekilde belirtilmelidir. Resmî ürün fotoğrafı gibi gösterilmemelidir.

## 4. Gelecekteki CMS için önerilen kayıt ilişkileri

```text
products (id, slug, title, summary, approval_state, publication_state)
technologies (id, slug, title, summary)
capabilities (id, technology_id, title, evidence_status)
projects (id, slug, title, description, stage, approval_state, publication_state)
project_technologies (project_id, technology_id)
project_products (project_id, product_id)
news (id, slug, project_id?, product_id?, title, published_at?, source_url?, approval_state)
media (id, related_type, related_id, file, rights_approved, alt_text)
```

- URL/slug tekil olmalı; yayınlandığında rastgele değişmemeli.
- **İçerik onayı** ile **ürün olgunluğu** farklı alanlardır.
- Özgün görsel ve haber kaynağı olmadan her kayıt yayımlanmak zorunda değildir.
- Yayından kaldırılan kayıtlar ziyaretçiye boş detay sayfası göstermemeli; uygun yönlendirme veya bilgilendirme kullanılmalı.

## 5. Mevcut prototipin güncel durumu

`app.js` içinde `PUBLIC_WORKS` ve `PUBLIC_NEWS` adında iki ayrı **statik içerik listesi** bulunmaktadır. Tengri AI ve uçuş kontrolcüsüyle ilgili ikişer kamuya açık tanıtım bu listelerde tutulur. Tarihi doğrulanmamış yayınlar için `publishedAt: null` kullanılır. Bu listeler yalnızca prototipte veri tekrarını azaltır; **Abdullah'ın giriş yapabildiği bir CMS veya veritabanı değildir**.

Gerçek içerikler ve yayın onayı geldikçe dinamik detay sayfaları ile Supabase/başka bir CMS altyapısı ayrıca tasarlanabilir. Şu aşamada gerçek olmayan performans verileri veya ürün kaydı oluşturulmamalıdır.

## 6. Tasarım ve bağlantı ilkesi

- Ana menüde yedi ana bölüm bulunur; Platformlar ve Teknolojiler için açılır alt menüler vardır.
- Kategori kartları ilgili detay sayfasına gidebilir; aynı hedefe tekrar yönlendiren ikinci bir buton eklenmez.
- Haber kartı özgün habere, proje kartı çalışmanın esas tanıtımına yönlenir.
- Her sayfada genel bir iletişim bandı bulunmaz; ana sayfadan bir iletişim yönlendirmesi ve kalıcı İletişim sayfası yeterlidir.
- İçerik az olduğunda boş detay sayfasını sırf sayfa sayısını artırmak için oluşturmayın.

**Müşteri kontrolü tamamlanmadan yayımlanmış teknik/kurumsal doğruluk iddiasında bulunmayın.**
