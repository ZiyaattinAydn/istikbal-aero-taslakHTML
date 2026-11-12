import {
  pageValue,
  pageData,
  pageImageStyle,
  type PageValues,
} from "@/lib/cms/page-values";
import { Section, SectionHeading, InnerHero } from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards as basecards } from "@/data/cards";

export function TechContent({ content = {} }: { content?: PageValues }) {
  const cards = pageData(basecards, "cards", content);
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "TechContent.title.0",
          "Teknolojiler",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "TechContent.description.1",
          "Donanım, kontrol, algılama ve yapay zekâ tabanlı sistemlerin buluştuğu mühendislik alanları.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "TechContent.image.2",
          "platform-systems.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "TechContent.breadcrumb.3",
          "TEKNOLOJILER",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "TechContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "TechContent.kicker.5",
            "TEKNOLOJİ ALANLARI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "TechContent.title.6",
            "Donanımdan otonomiye.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "TechContent.lead.7",
            "Elektronik tasarım, gömülü yazılım, sensör füzyonu ve sistem entegrasyonu birbirini tamamlayan disiplinlerdir. Teknoloji alanları, sistemlerin alt katmanlarını birlikte ele alır.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"cards-2"}>
          <TechnologyCard {...cards.technology[19]} />
          <TechnologyCard {...cards.technology[20]} />
          <TechnologyCard {...cards.technology[21]} />
          <TechnologyCard {...cards.technology[22]} />
          <TechnologyCard {...cards.technology[23]} />
          <TechnologyCard {...cards.technology[24]} />
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <div className={"split-feature"}>
          <div
            className={"visual"}
            style={{
              backgroundImage: pageImageStyle(
                content,
                "TechContent.image.8",
                "tengri-network.svg",
              )!.backgroundImage,
            }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>
              {pageValue(
                content,
                "TechContent.text.9",
                "YAPAY ZEKÂ / TENGRİ AI",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "TechContent.text.10",
                "Ağ bağlantılı karar destek.",
                "text",
                "Metin",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "TechContent.text.11",
                "Tengri AI, şirketin kamuya açık tanıtımında bağlı hava ve kara sistemlerinin koordinasyonunu hedefleyen yapay zekâ yaklaşımı olarak anlatılıyor.",
                "text",
                "Metin",
              )}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
