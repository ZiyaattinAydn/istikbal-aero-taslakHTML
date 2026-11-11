import { pageValue, pageData, type PageValues } from "@/lib/cms/page-values";
import {
  Section,
  SectionHeading,
  InnerHero,
  FeatureRow,
} from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards as basecards } from "@/data/cards";

export function CapabilitiesContent({
  content = {},
}: {
  content?: PageValues;
}) {
  const cards = pageData(basecards, "cards", content);
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "CapabilitiesContent.title.0",
          "Kabiliyetler",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "CapabilitiesContent.description.1",
          "İnsansız sistemlerden gömülü elektroniğe uzanan mühendislik çalışma alanları.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "CapabilitiesContent.image.2",
          "research-lab.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "CapabilitiesContent.breadcrumb.3",
          "TEKNOLOJİLER / KABİLİYETLER",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "CapabilitiesContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "CapabilitiesContent.kicker.5",
            "MÜHENDİSLİK & TEKNOLOJİ ALANLARI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "CapabilitiesContent.title.6",
            "Sistemlerin yapı taşları.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "CapabilitiesContent.lead.7",
            "İstikbal Aerospace’in kamuya açık faaliyet ve uzmanlık tanıtımlarında yer alan başlıklar: insansız hava sistemleri, roket sistemleri, hava savunma ağları, haberleşme, gömülü donanım ve algılama.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"cards-3"}>
          <TechnologyCard {...cards.technology[4]} />
          <TechnologyCard {...cards.technology[5]} />
          <TechnologyCard {...cards.technology[6]} />
          <TechnologyCard {...cards.technology[7]} />
          <TechnologyCard {...cards.technology[8]} />
          <TechnologyCard {...cards.technology[9]} />
        </div>
      </Section>
      <Section>
        <FeatureRow
          title={pageValue(
            content,
            "CapabilitiesContent.title.8",
            "Otonom Sistemler",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "CapabilitiesContent.kicker.9",
            "OTONOMİ",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "CapabilitiesContent.description.10",
            "Veri analizi, kontrol mantığı ve karar mekanizmalarının bir arada ele alındığı sistemler.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "CapabilitiesContent.image.11",
            "platform-flight.svg",
            "image",
            "Görsel",
          )}
          reverse={false}
          href={""}
          label={""}
        />
        <div style={{ height: "28px" }}></div>
        <FeatureRow
          title={pageValue(
            content,
            "CapabilitiesContent.title.12",
            "Gömülü Donanım & PCB",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "CapabilitiesContent.kicker.13",
            "ELEKTRONİK",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "CapabilitiesContent.description.14",
            "Elektronik kart tasarımı, gömülü işlemciler ve donanım-yazılım entegrasyonu.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "CapabilitiesContent.image.15",
            "platform-systems.svg",
            "image",
            "Görsel",
          )}
          reverse={true}
          href={""}
          label={""}
        />
        <div style={{ height: "28px" }}></div>
        <FeatureRow
          title={pageValue(
            content,
            "CapabilitiesContent.title.16",
            "Sensör Füzyonu",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "CapabilitiesContent.kicker.17",
            "ALGILAMA",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "CapabilitiesContent.description.18",
            "Farklı sensör verilerinin işlenmesi ve tek bir sistem görünümüne dönüştürülmesi.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "CapabilitiesContent.image.19",
            "tengri-network.svg",
            "image",
            "Görsel",
          )}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={pageValue(
            content,
            "CapabilitiesContent.kicker.20",
            "YAPAY ZEKÂ",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "CapabilitiesContent.title.21",
            "Tengri AI.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "CapabilitiesContent.lead.22",
            "Şirketin yapay zekâ ve ağ merkezli karar desteği üzerine kamuya açık teknoloji yaklaşımı, diğer mühendislik disiplinleriyle ilişkilidir.",
            "text",
            "Açıklama",
          )}
        />
      </Section>
    </>
  );
}
