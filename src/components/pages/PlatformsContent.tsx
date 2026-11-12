import { pageValue, pageData, type PageValues } from "@/lib/cms/page-values";
import {
  Section,
  SectionHeading,
  InnerHero,
  FeatureRow,
} from "@/components/ui/content";
import { TechnologyCard, PlatformCard } from "@/components/cards/Cards";
import { cards as basecards } from "@/data/cards";

export function PlatformsContent({ content = {} }: { content?: PageValues }) {
  const cards = pageData(basecards, "cards", content);
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "PlatformsContent.title.0",
          "Platformlar",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "PlatformsContent.description.1",
          "Hava platformları, uçuş kontrolü ve sistem mühendisliği odağındaki çalışma başlıkları.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "PlatformsContent.image.2",
          "hero-hangar-photo.webp",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "PlatformsContent.breadcrumb.3",
          "PLATFORMLAR",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "PlatformsContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "PlatformsContent.kicker.5",
            "HAVACILIK & SİSTEMLER",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "PlatformsContent.title.6",
            "Platformdan alt sisteme.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "PlatformsContent.lead.7",
            "İstikbal Aerospace’in kamuya açık uzmanlık alanlarından hareketle sunulan sistem aileleri. Bu başlıklar bir ürün kataloğu değil, mühendislik alanlarıdır.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"platform-grid"}>
          <PlatformCard {...cards.platform[3]} />
          <PlatformCard {...cards.platform[4]} />
          <PlatformCard {...cards.platform[5]} />
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <FeatureRow
          title={pageValue(
            content,
            "PlatformsContent.title.8",
            "Yapay zekâ destekli uçuş kontrolü.",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "PlatformsContent.kicker.9",
            "KAMUYA AÇIK TEKNOLOJİ TANITIMI",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "PlatformsContent.description.10",
            "Şirketin paylaştığı yeni nesil uçuş kontrolcüsü tanıtımında yapay zekâ ile ilişkili kontrol algoritmaları, uçuş güvenliği ve verimlilik hedefleri öne çıkıyor. Teknolojinin mühendislik temellerini inceleyin.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "PlatformsContent.image.11",
            "platform-systems.svg",
            "image",
            "Görsel",
          )}
          reverse={false}
          href={pageValue(
            content,
            "PlatformsContent.href.12",
            "ucus-kontrol-paylasimi.html",
            "link",
            "Bağlantı",
          )}
          label={pageValue(
            content,
            "PlatformsContent.label.13",
            "Tanıtımı İncele",
            "text",
            "Bağlantı metni",
          )}
        />
      </Section>
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "PlatformsContent.kicker.14",
            "İLGİLİ TEKNOLOJİLER",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "PlatformsContent.title.15",
            "Bir platformun ötesindeki sistemler.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "PlatformsContent.lead.16",
            "Elektronik tasarım, yazılım ve sensör verisinin birlikte değerlendirilmesi platform mühendisliğinin temelindedir.",
            "text",
            "Açıklama",
          )}
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
