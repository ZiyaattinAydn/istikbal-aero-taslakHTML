import {
  Section,
  SectionHeading,
  InnerHero,
  FeatureRow,
} from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards } from "@/data/cards";

export function CapabilitiesContent() {
  return (
    <>
      <InnerHero
        title={"Kabiliyetler"}
        description={
          "İnsansız sistemlerden gömülü elektroniğe uzanan mühendislik çalışma alanları."
        }
        image={"research-lab.svg"}
        breadcrumb={"TEKNOLOJİLER / KABİLİYETLER"}
        kicker={"İSTİKBAL AEROSPACE"}
      />
      <Section>
        <SectionHeading
          kicker={"MÜHENDİSLİK & TEKNOLOJİ ALANLARI"}
          title={"Sistemlerin yapı taşları."}
          lead={
            "İstikbal Aerospace’in kamuya açık faaliyet ve uzmanlık tanıtımlarında yer alan başlıklar: insansız hava sistemleri, roket sistemleri, hava savunma ağları, haberleşme, gömülü donanım ve algılama."
          }
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
          title={"Otonom Sistemler"}
          kicker={"OTONOMİ"}
          description={
            "Veri analizi, kontrol mantığı ve karar mekanizmalarının bir arada ele alındığı sistemler."
          }
          image={"platform-flight.svg"}
          reverse={false}
          href={""}
          label={""}
        />
        <div style={{ height: "28px" }}></div>
        <FeatureRow
          title={"Gömülü Donanım & PCB"}
          kicker={"ELEKTRONİK"}
          description={
            "Elektronik kart tasarımı, gömülü işlemciler ve donanım-yazılım entegrasyonu."
          }
          image={"platform-systems.svg"}
          reverse={true}
          href={""}
          label={""}
        />
        <div style={{ height: "28px" }}></div>
        <FeatureRow
          title={"Sensör Füzyonu"}
          kicker={"ALGILAMA"}
          description={
            "Farklı sensör verilerinin işlenmesi ve tek bir sistem görünümüne dönüştürülmesi."
          }
          image={"tengri-network.svg"}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={"YAPAY ZEKÂ"}
          title={"Tengri AI."}
          lead={
            "Şirketin yapay zekâ ve ağ merkezli karar desteği üzerine kamuya açık teknoloji yaklaşımı, diğer mühendislik disiplinleriyle ilişkilidir."
          }
        />
      </Section>
    </>
  );
}
