# İstikbal Aerospace — Bilgi Mimarisi ve İçerik Koruma Kararı
**Tarih:** 8 Kasım 2026  
**Aşama:** Navigasyon sadeleştirme / içerik koruma  
**Temel karar:** Ana navigasyon 7 başlıkta kalır. Kullanılabilir bütün mevcut sayfalar, metinler, bağlantılar ve medya korunur. Yeni müşteri verileri geldikçe ürün/proje/teknoloji ayrımı kesinleştirilir.

## 1. Neden bu yaklaşım?
Bir platform/ürün, şirketin sunabildiği somut sistem veya ürün ailesidir; bir teknoloji veya kabiliyet, onu mümkün kılan bilgi ve mühendislik pratiğidir; bir AR-GE projesi belirli hedefi ve aşaması olan çalışmadır; haber ise tarihli gelişmenin kaydıdır. Tek bir çalışma farklı bağlamlara bağlanabilir fakat aynı içeriği art arda tekrar etmek yerine referanslanmalıdır.

Mevcut prototipte özgün müşteri ürün verileri henüz tam aktarılmadığı için tek tek detay sayfalarını silmek, erken ve geri dönüşü zor bir karar olacaktır. Ayrıca ürün ve teknik başarı iddiaları müşteri onayı gerektirir. Bu nedenle bugün **bilgi mimarisi ve gezinme** düzenlenmiş, sayfa gövdeleri değiştirilmemiştir.

## 2. Üst navigasyon (7 alan)
1. Ana Sayfa → `index.html`
2. Platformlar → `platformlar.html`
3. Teknolojiler → `teknolojiler.html`
4. Projeler & AR-GE → `projeler.html`
5. Haberler → `haberler.html`
6. Kurumsal → `kurumsal.html`
7. İletişim → `iletisim.html`

### Platformlar alt menüsü (4 bağlantı)
- Tüm Platformlar → `platformlar.html`
- İnsansız Hava Sistemleri → `iha-sistemleri.html`
- Gömülü Uçuş Mimarileri → `ucus-mimarileri.html`
- Hava Savunma Ağları → `hava-savunma-aglari.html`

### Teknolojiler alt menüsü (8 bağlantı)
- Tüm Teknolojiler → `teknolojiler.html`
- Tengri AI → `tengri-ai.html`
- Kabiliyetler → `kabiliyetler.html`
- Otonom Sistemler → `otonom-sistemler.html`
- Gömülü Sistemler → `gomulu-sistemler.html`
- Sensör Füzyonu → `sensor-fuzyonu.html`
- Roket Sistemleri → `roket-sistemleri.html`
- İleri Haberleşme → `ileri-haberlesme.html`

**Kabiliyetler** ayrı ana menü değildir; Teknolojiler içinde erişilebilir ve kendi sayfası şimdilik korunmaktadır. Ürün-kabiliyet ayrımı gerçek şirket verileri geldikten sonra değişebilir.

## 3. Diğer mevcut sayfaların durumu
| Dosya | İşlev | Bugünkü karar |
|---|---|---|
| `projeler.html` | Kamuya açık çalışmalar ve AR-GE alanları | Koru; müşteri verisiyle genişlet |
| `haberler.html` | Yayın/duyuru listesi | Koru; tarihler ve kaynaklar onaylanınca doldur |
| `haber-detay.html` | Tengri AI şirket paylaşımı | Koru; özgün paylaşım bağlantısı/mesajı onaylı |
| `ucus-kontrol-paylasimi.html` | Uçuş kontrolcüsü paylaşımı | Koru; tarih/kaynak/onay gerekli |
| `kurumsal.html` | Hakkımızda, yaklaşım, disiplinler | Koru |
| `iletisim.html` | İletişim; sunucuya bağlı olmayan form | Koru, form henüz mesaj göndermez |
| `platform-detay.html` | Genel platform bilgi şablonu | Dosyayı silme; ana menüye ekleme; gerçek veriye göre karar ver |
| `proje-detay.html` | Genel AR-GE bilgi şablonu | Dosyayı silme; ana menüye ekleme; gerçek veriye göre karar ver |
| `404.html` | Statik yayın hata sayfası | Koru |

**Toplam:** 21 içerik HTML + 404 hata sayfası, ayrıca CSS/JS ve görsel dosyaları. Sayfa sayısı azaltılmadı.

## 4. Sektöre uygun gelecekteki CMS yapısı
Ayrı içerik türleri önerilir:
- **products/platforms**: Ürün adı, özet, resmî görseller, doğrulanabilir teknik özellikler, olgunluk statüsü, yayın onayı.
- **capabilities/technologies**: Teknoloji adı, yetkinlik kapsamı, açıklama, ilgili ürün/proje ilişkileri.
- **projects**: Proje amacı, aşama, dönem, ilgili teknoloji ve ürün, müşteri tarafından yayımlanabilir çıktılar.
- **news**: Başlık, içerik, gerçek yayın tarihi, görsel, özgün kaynak URL'si, ilişkili proje/ürün.
- **media**: Sahiplik, haklar, görsel açıklaması, alt metin, kullanım izni.
- **content approvals**: Taslak → inceleme → onaylı/yayında, açıklanabilirlik ve revizyon geçmişi.

Aynı çalışma farklı sayfalardan **ilişkisel bağlantılar** aracılığıyla keşfedilmeli; aynı metnin bağımsız kopyaları oluşturulmamalı. Gizli teknik ayrıntılar, performans ve operasyonel başarılar yetkili kişi onayı olmadan yayımlanmamalı.

## 5. Uygulanan değişikliklerin kapsamı
- Platformlar için masaüstü mega menü + mobil açılır alt menü oluşturuldu.
- Teknolojiler alt menüsü korundu; iki grup aynı navigasyon mantığıyla erişilebilir.
- Geriye dönük tüm dosya ve URL'ler korundu; bağlantılar yeniden adlandırılmadı.
- `app.js` içindeki **ana sayfa ve bütün alt sayfaların içerik üreten bölümü**, değişiklik öncesi kaynakla byte düzeyinde karşılaştırıldı ve birebir aynı bulundu.
- Tema, görseller, sinematik scroll ve içerik/görsel şablonları değiştirilmedi.

## 6. Test ve sınırlama
- JavaScript sözdizimi kontrolü geçti.
- 12 farklı sayfa kimliği için navigasyon HTML'i oluşturularak menü kimliklerinin benzersizliği, bütünlük ve yerel bağlantılar incelendi.
- 22 HTML dosyası ve alt menü bağlantıları GitHub dosya envanteriyle kontrol edildi; eksik hedef bulunmadı.
- Dinamik tarayıcı, mobil Safari, gerçek cihaz ve ekran okuyucu kontrolleri bu aşamada tamamlanmadı; bunlar ayrıca gözle doğrulanmalıdır.
- Orijinal `istikbalaerospace.com` yedeği olmadığından **orijinal sitedeki her bilginin aktarıldığı** iddiası geçerli değildir.

## 7. Abdullah'tan beklenen veriler
Ürün/kabiliyet/proje ayrımını somutlaştırabilmek için gerçek ürün isimleri ve olgunluk düzeyleri; AR-GE projelerinin durumları ve yayımlanabilir kayıtları; teknik yetkinlik listesi; markalı görseller ve telif/onay bilgileri; resmî açıklamalar ve haber kayıtları gereklidir. Bunlar gelince bazı teknoloji detayları birleştirilebilir veya gerçek ürün sayfaları olarak genişletilebilir. **Sayfa sayısı önceden sabitlenmeyecek.**

## 8. Önceki çalışmalar
- [Altı adımlı içerik envanteri](icerik-envanteri-2026-11-08.md)
- [Teknik yayın kontrolü](qa-ve-yayin-kontrolu-2026-11-08.md)

**Sonuç:** Bilgi mimarisi revizyonunun ilk, içerik kaybettirmeyen bölümü tamamlandı. İleride müşteri verisi ile yapılacak ürün/proje modellemesi için mevcut sayfalar güvenle korunuyor.
