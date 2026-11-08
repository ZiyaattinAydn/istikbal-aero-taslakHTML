import type {
  TechnologyCardData,
  PlatformCardData,
} from "@/data/models";
export const cards = {
  technology: [
    {
      title: "Otonom Sistemler",
      sequence: "01",
      symbol: "⌁",
      description: "Algılama, karar süreçleri ve kontrol algoritmaları.",
      href: "otonom-sistemler.html",
    },
    {
      title: "Gömülü Sistemler & PCB",
      sequence: "02",
      symbol: "▦",
      description: "Elektronik kart tasarımı, donanım ve gömülü yazılım.",
      href: "gomulu-sistemler.html",
    },
    {
      title: "Sensör Füzyonu",
      sequence: "03",
      symbol: "◎",
      description: "Farklı algılayıcılardan gelen verilerin bütünleştirilmesi.",
      href: "sensor-fuzyonu.html",
    },
    {
      title: "Yapay Zekâ & Tengri AI",
      sequence: "04",
      symbol: "⟡",
      description:
        "Ağ tabanlı karar destek ve savunma teknolojileri yaklaşımı.",
      href: "tengri-ai.html",
    },
    {
      title: "İnsansız Hava Araçları",
      sequence: "01",
      symbol: "✈",
      description: "Hava platformları ve otonom uçuş mimarileri.",
      href: "iha-sistemleri.html",
    },
    {
      title: "Hava Savunma Ağları",
      sequence: "02",
      symbol: "⌁",
      description: "Ağ bağlantılı hava savunma ve karar destek yaklaşımı.",
      href: "hava-savunma-aglari.html",
    },
    {
      title: "İleri Haberleşme",
      sequence: "03",
      symbol: "⌁",
      description: "Bağlantılı platformlar ve taktik veri iletimi odağı.",
      href: "ileri-haberlesme.html",
    },
    {
      title: "Roket Sistemleri",
      sequence: "04",
      symbol: "◇",
      description:
        "Roket projelerinde uçuş elektroniği ve sistem entegrasyonu hakkında genel mühendislik çerçevesi.",
      href: "roket-sistemleri.html",
    },
    {
      title: "Gömülü Donanım & PCB",
      sequence: "05",
      symbol: "▦",
      description: "Elektronik kart tasarımı ve donanım-yazılım bütünlüğü.",
      href: "gomulu-sistemler.html",
    },
    {
      title: "Sensör Füzyonu",
      sequence: "06",
      symbol: "◎",
      description: "Birden fazla veri kaynağının birlikte değerlendirilmesi.",
      href: "sensor-fuzyonu.html",
    },
    {
      title: "Gömülü Uçuş Sistemleri",
      sequence: "01",
      symbol: "▦",
      description:
        "Hava araçları için donanım ve yazılım mimarilerinin tasarımı.",
      href: "ucus-mimarileri.html",
    },
    {
      title: "Otonom Algoritmalar",
      sequence: "02",
      symbol: "⌁",
      description:
        "Algılama, karar mekanizmaları ve otonom sistemlerin mühendislik temelleri.",
      href: "otonom-sistemler.html",
    },
    {
      title: "Yapay Zekâ & Sistemler",
      sequence: "03",
      symbol: "◎",
      description:
        "Tengri AI çevresinde ele alınan yapay zekâ destekli savunma ağı konseptleri.",
      href: "tengri-ai.html",
    },
    {
      title: "Otonom Sistemler",
      sequence: "01",
      symbol: "⌁",
      description: "Algılama ve kontrolün birleştiği yazılım alanı.",
      href: "otonom-sistemler.html",
    },
    {
      title: "Gömülü Sistemler",
      sequence: "02",
      symbol: "▦",
      description: "Uçuş elektroniği ve sistem denetimi.",
      href: "gomulu-sistemler.html",
    },
    {
      title: "Sensör Füzyonu",
      sequence: "03",
      symbol: "◎",
      description: "Çoklu veri kaynağının birlikte değerlendirilmesi.",
      href: "sensor-fuzyonu.html",
    },
    {
      title: "PCB Tasarımı",
      sequence: "01",
      symbol: "▦",
      description: "Gömülü donanım için elektronik kart mimarileri.",
      href: "gomulu-sistemler.html",
    },
    {
      title: "Otonom Hareket",
      sequence: "02",
      symbol: "⌁",
      description: "Karar, kontrol ve geri bildirim mekanizmaları.",
      href: "otonom-sistemler.html",
    },
    {
      title: "Algılama & Veri",
      sequence: "03",
      symbol: "◎",
      description: "Sensör bilgisi ve sistem entegrasyonu.",
      href: "sensor-fuzyonu.html",
    },
    {
      title: "Otonom Sistemler",
      sequence: "01",
      symbol: "⌁",
      description:
        "Sensör verilerinin değerlendirilmesi, karar ve kontrol algoritmaları.",
      href: "otonom-sistemler.html",
    },
    {
      title: "Gömülü Donanım & PCB",
      sequence: "02",
      symbol: "▦",
      description:
        "Elektronik kart tasarımı, işlemci tabanlı sistemler ve gömülü yazılım.",
      href: "gomulu-sistemler.html",
    },
    {
      title: "Sensör Füzyonu",
      sequence: "03",
      symbol: "◎",
      description:
        "Birden fazla algılayıcıdan gelen bilginin birlikte işlenmesi.",
      href: "sensor-fuzyonu.html",
    },
    {
      title: "Yapay Zekâ / Tengri AI",
      sequence: "04",
      symbol: "⟡",
      description:
        "Karar destek ve bağlantılı savunma ağlarına odaklanan teknoloji yaklaşımı.",
      href: "tengri-ai.html",
    },
    {
      title: "Roket Sistemleri",
      sequence: "05",
      symbol: "◇",
      description:
        "Roket teknolojileriyle ilişkili uçuş elektroniği, telemetri ve sistem mühendisliğine genel bakış.",
      href: "roket-sistemleri.html",
    },
    {
      title: "İleri Haberleşme",
      sequence: "06",
      symbol: "⌁",
      description:
        "Bağlantılı platformlarda veri iletimi, güvenli haberleşme ve sistem entegrasyonu.",
      href: "ileri-haberlesme.html",
    },
    {
      title: "Veri & Sensör Birleşimi",
      sequence: "01",
      symbol: "◎",
      description:
        "Farklı kaynaklardan elde edilen bilgilerin ortak bir durum görünümüne katkıda bulunması.",
      href: "sensor-fuzyonu.html",
    },
    {
      title: "Çoklu Hedef Takibi",
      sequence: "02",
      symbol: "⌁",
      description:
        "Birden fazla hava unsuruna ilişkin iz bilgilerinin birlikte değerlendirilmesi fikri.",
      href: "hava-savunma-aglari.html",
    },
    {
      title: "Tehdit Analizi",
      sequence: "03",
      symbol: "◇",
      description:
        "Yapay zekâ destekli değerlendirme ve önceliklendirme süreçlerinin karar desteğindeki rolü.",
      href: "hava-savunma-aglari.html",
    },
    {
      title: "Öngörüsel Değerlendirme",
      sequence: "04",
      symbol: "⟡",
      description:
        "Gelişen durumların ve olası senaryoların önceden değerlendirilmesine yönelik yaklaşım.",
      href: "otonom-sistemler.html",
    },
    {
      title: "Komuta & Kontrol",
      sequence: "05",
      symbol: "▦",
      description:
        "Bağlı unsurlardan alınan bilgilerin ortak bir karar ve koordinasyon çerçevesinde incelenmesi.",
      href: "hava-savunma-aglari.html",
    },
    {
      title: "Ağ Tabanlı Entegrasyon",
      sequence: "06",
      symbol: "↗",
      description:
        "Farklı platform ve sistemlerin haberleşme ve veri paylaşımı yoluyla birlikte ele alınması.",
      href: "ileri-haberlesme.html",
    },
  ],
  platform: [
    {
      title: "İnsansız Hava Sistemleri",
      sequence: "01",
      image: "hero-hangar-photo.webp",
      large: true,
      href: "iha-sistemleri.html",
      description: "İnsansız platform mimarileri ve hava aracı sistemleri.",
    },
    {
      title: "Gömülü Uçuş Mimarileri",
      sequence: "02",
      image: "platform-systems.svg",
      large: false,
      href: "ucus-mimarileri.html",
      description: "Donanım, yazılım ve kontrol katmanları.",
    },
    {
      title: "Hava Savunma Ağları",
      sequence: "03",
      image: "platform-flight.svg",
      large: false,
      href: "hava-savunma-aglari.html",
      description: "Birbirine bağlı savunma sistemleri yaklaşımı.",
    },
    {
      title: "İnsansız Hava Sistemleri",
      sequence: "01",
      image: "hero-hangar-photo.webp",
      large: true,
      href: "iha-sistemleri.html",
      description:
        "Uçuş kontrolü, algılama ve bağlantılı alt sistemlerin bütünleşik mimarisi.",
    },
    {
      title: "Gömülü Uçuş Mimarileri",
      sequence: "02",
      image: "platform-systems.svg",
      large: false,
      href: "ucus-mimarileri.html",
      description:
        "Uçuş elektroniği, gömülü yazılım ve platform kontrolünün bileşenleri.",
    },
    {
      title: "Hava Savunma Ağları",
      sequence: "03",
      image: "platform-flight.svg",
      large: false,
      href: "hava-savunma-aglari.html",
      description:
        "Bağlantılı sistemler ve karar destek teknolojileri yaklaşımı.",
    },
  ],
} satisfies {
  technology: TechnologyCardData[];
  platform: PlatformCardData[];
};
