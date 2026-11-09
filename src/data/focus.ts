import type { FocusData, PlatformFocusData } from "./models";
export const focusData = {
  autonomy: {
    title: "Otonom Sistemler",
    kicker: "SİSTEM MÜHENDİSLİĞİ / 01",
    tagline: "Algılama, karar verme ve kontrolün buluştuğu alan.",
    bg: "platform-flight.svg",
    intro:
      "Otonom sistemler; çevreyi algılama, veriyi yorumlama ve belirlenen hedeflere göre hareket üretme gibi farklı mühendislik disiplinlerini bir araya getirir. Bu sayfa, konunun genel yaklaşımını tanıtır.",
    modules: [
      [
        "01",
        "Algılama ve veri",
        "Sensörlerden gelen verilerin sistem tarafından yorumlanmasına yönelik mühendislik yaklaşımı.",
      ],
      [
        "02",
        "Karar mekanizmaları",
        "Algılanan duruma göre kuralların ve algoritmaların rolünü açıklayan genel çerçeve.",
      ],
      [
        "03",
        "Kontrol ve geri bildirim",
        "Ölçüm, kontrol ve geri bildirim döngülerinin sistem tasarımındaki yeri.",
      ],
    ],
    related: "Gömülü Sistemler",
    to: "gomulu-sistemler.html",
  },
  embedded: {
    title: "Gömülü Sistemler",
    kicker: "DONANIM & YAZILIM / 02",
    tagline: "Donanımla yazılımın birlikte düşünüldüğü sistemler.",
    bg: "platform-systems.svg",
    intro:
      "Gömülü sistem geliştirme; işlem birimi, çevre birimleri, yazılım ve haberleşme arayüzlerinin birlikte ele alınmasını gerektirir. Buradaki başlıklar teknik yaklaşımın genel bir açıklamasıdır.",
    modules: [
      [
        "01",
        "Elektronik mimari",
        "Elektronik bileşenlerin işlevsel bir sistem içinde düzenlenmesine dair temel yaklaşım.",
      ],
      [
        "02",
        "Gömülü yazılım",
        "Donanım kaynaklarını yöneten ve sistem davranışını tanımlayan yazılım katmanı.",
      ],
      [
        "03",
        "Entegrasyon ve test",
        "Donanım ve yazılımın birlikte değerlendirilmesi, arayüzlerin doğrulanması.",
      ],
    ],
    related: "Sensör Füzyonu",
    to: "sensor-fuzyonu.html",
  },
  sensors: {
    title: "Sensör Füzyonu",
    kicker: "ALGILAMA & ENTEGRASYON / 03",
    tagline: "Birden fazla veri kaynağından daha tutarlı bir tablo.",
    bg: "tengri-network.svg",
    intro:
      "Sensör füzyonu, farklı algılayıcılardan elde edilen bilgilerin değerlendirilerek birlikte kullanılmasına yönelik mühendislik alanıdır. Açıklamalar genel teknoloji tanıtımıdır; şirkete özgü performans iddiası içermez.",
    modules: [
      [
        "01",
        "Veri kaynakları",
        "Farklı ölçümlerin nitelikleri, zamanlaması ve kullanılabilirliği.",
      ],
      [
        "02",
        "Birleştirme yaklaşımı",
        "Farklı kaynaklardan gelen bilgilerin karşılaştırılması ve birlikte ele alınması.",
      ],
      [
        "03",
        "Sistem ilişkileri",
        "Algılama katmanının otonomi ve gömülü sistemlerle bağlantısı.",
      ],
    ],
    related: "Otonom Sistemler",
    to: "otonom-sistemler.html",
  },
  rockets: {
    title: "Roket Sistemleri",
    kicker: "HAVACILIK & UZAY / 04",
    tagline: "Uçuş elektroniği, telemetri ve sistem bütünlüğü.",
    bg: "platform-flight.svg",
    intro:
      "Roket sistemleri, İstikbal Aerospace’in kamuya açık uzmanlık alanları listesinde geçmektedir. Bu sayfa roket projelerinde ele alınan genel mühendislik disiplinlerini tanıtır; şirkete ait belirli bir ürün, uçuş testi veya performans iddiası içermez.",
    modules: [
      [
        "01",
        "Uçuş elektroniği",
        "Algılama, kontrol ve uçuş bilgisinin değerlendirilmesinde elektronik bileşenlerin genel rolü.",
      ],
      [
        "02",
        "Telemetri ve haberleşme",
        "Sistem verilerinin izlenmesi ve bağlantılı birimlerle bilgi alışverişi.",
      ],
      [
        "03",
        "Entegrasyon ve doğrulama",
        "Elektronik, yazılım ve mekanik alt sistemlerin bütün halinde ele alınması.",
      ],
    ],
    related: "Gömülü Uçuş Mimarileri",
    to: "ucus-mimarileri.html",
  },
  communications: {
    title: "İleri Haberleşme",
    kicker: "VERİ BAĞLANTILARI / 05",
    tagline: "Bağlantılı sistemler arasında bilgi akışı ve entegrasyon.",
    bg: "tengri-network.svg",
    intro:
      "İstikbal Aerospace’in kamuya açık şirket özetinde haberleşme sistemleri ve şifreli taktik veri bağlantıları çalışma alanları arasında anılmaktadır. Burada haberleşme mimarilerinin genel ilkeleri yer alır; doğrulanmamış teknik uygulama, kapasite veya operasyonel ürün iddiası sunulmaz.",
    modules: [
      [
        "01",
        "Veri iletimi",
        "Bağlantılı platformlar arasında durum ve ölçüm bilgilerinin aktarılmasına dair temel yaklaşım.",
      ],
      [
        "02",
        "Güvenlik ve bütünlük",
        "İletilen bilginin güvenliğinin ve tutarlılığının sistem tasarımında değerlendirilmesi.",
      ],
      [
        "03",
        "Sistem entegrasyonu",
        "Haberleşme katmanının sensörler, gömülü yazılım ve üst sistemlerle birlikte ele alınması.",
      ],
    ],
    related: "Sensör Füzyonu",
    to: "sensor-fuzyonu.html",
  },
} satisfies Record<string, FocusData>;
export const platformFocusData = {
  iha: {
    title: "İnsansız Hava Sistemleri",
    description: "Hava platformları, otonom uçuş ve sistem mühendisliği.",
    image: "hero-hangar-photo.webp",
    kicker: "İNSANSIZ HAVA SİSTEMLERİ",
    intro:
      "İnsansız hava araçları; gövde, elektronik, uçuş kontrolü, haberleşme ve sensör sistemlerinin birlikte çalışmasını gerektiren bütünleşik platformlardır.",
    modules: [
      [
        "Uçuş elektroniği",
        "Uçuş kontrolü ve gömülü sistemler ile platform yönetimi.",
      ],
      [
        "Otonom hareket",
        "Sensör verileri, karar mekanizmaları ve kontrol katmanları.",
      ],
      [
        "Haberleşme",
        "Verinin platform bileşenleri arasında ve bağlantılı sistemlerde iletilmesi.",
      ],
    ],
  },
  flightArch: {
    title: "Gömülü Uçuş Mimarileri",
    description:
      "Donanım ve yazılımın birlikte geliştirildiği uçuş sistemleri.",
    image: "platform-systems.svg",
    kicker: "GÖMÜLÜ UÇUŞ MİMARİSİ",
    intro:
      "Uçuş sistemlerinde gömülü mimari; kart tasarımı, işlem birimi, çevre birimleri, veri arabirimleri ve kontrol yazılımının birlikte değerlendirilmesini gerektirir.",
    modules: [
      [
        "Elektronik tasarım",
        "PCB ve temel elektronik bileşenlerin sistem ihtiyaçlarına göre ele alınması.",
      ],
      ["Gömülü yazılım", "Donanım kaynakları, zamanlama ve sistem davranışı."],
      [
        "Entegrasyon",
        "Bileşenlerin bütünleşik yapı içinde çalışmasının değerlendirilmesi.",
      ],
    ],
  },
  airDefense: {
    title: "Hava Savunma Ağları",
    description: "Algılama, bağlantı ve karar destek yaklaşımı.",
    image: "tengri-network.svg",
    kicker: "AĞ BAĞLANTILI SİSTEMLER",
    intro:
      "İstikbal Aerospace’in kamuya açık açıklamalarında hava savunma ağları ve yapay zekâ destekli koordinasyon yaklaşımları çalışma alanları arasında yer alır.",
    modules: [
      [
        "Algılama",
        "Farklı veri kaynaklarından durumsal bilgi elde etme yaklaşımı.",
      ],
      [
        "Veri bağlantısı",
        "Bağlı sistemler arasında haberleşme ve bilgi akışı.",
      ],
      [
        "Karar desteği",
        "Tengri AI başlığıyla ilişkili değerlendirme ve koordinasyon katmanları.",
      ],
    ],
  },
} satisfies Record<string, PlatformFocusData>;
