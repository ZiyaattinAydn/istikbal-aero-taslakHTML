import {
  Section,
  SectionHeading,
  InnerHero,
  FeatureRow,
} from "@/components/ui/content";
import { TechnologyCard, PlatformCard } from "@/components/cards/Cards";
import { cards } from "@/data/cards";

export function PlatformsContent() {
  return (
    <>
      <InnerHero
        title={"Platformlar"}
        description={
          "Hava platformları, uçuş kontrolü ve sistem mühendisliği odağındaki çalışma başlıkları."
        }
        image={"hero-hangar-photo.webp"}
        breadcrumb={"PLATFORMLAR"}
        kicker={"İSTİKBAL AEROSPACE"}
      />
      <Section>
        <SectionHeading
          kicker={"HAVACILIK & SİSTEMLER"}
          title={"Platformdan alt sisteme."}
          lead={
            "İstikbal Aerospace’in kamuya açık uzmanlık alanlarından hareketle sunulan sistem aileleri. Bu başlıklar bir ürün kataloğu değil, mühendislik alanlarıdır."
          }
        />
        <div className={"platform-grid"}>
          <PlatformCard {...cards.platform[3]} />
          <PlatformCard {...cards.platform[4]} />
          <PlatformCard {...cards.platform[5]} />
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <FeatureRow
          title={"Yapay zekâ destekli uçuş kontrolü."}
          kicker={"KAMUYA AÇIK TEKNOLOJİ TANITIMI"}
          description={
            "Şirketin paylaştığı yeni nesil uçuş kontrolcüsü tanıtımında yapay zekâ ile ilişkili kontrol algoritmaları, uçuş güvenliği ve verimlilik hedefleri öne çıkıyor. Teknolojinin mühendislik temellerini inceleyin."
          }
          image={"platform-systems.svg"}
          reverse={false}
          href={"ucus-kontrol-paylasimi.html"}
          label={"Tanıtımı İncele"}
        />
      </Section>
      <Section>
        <SectionHeading
          kicker={"İLGİLİ TEKNOLOJİLER"}
          title={"Bir platformun ötesindeki sistemler."}
          lead={
            "Elektronik tasarım, yazılım ve sensör verisinin birlikte değerlendirilmesi platform mühendisliğinin temelindedir."
          }
        />
        <div className={"cards-3"}>
          <TechnologyCard {...cards.technology[13]} />
          <TechnologyCard {...cards.technology[14]} />
          <TechnologyCard {...cards.technology[15]} />
        </div>
      </Section>
    </>
  );
}
