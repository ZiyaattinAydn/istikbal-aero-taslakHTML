import { pageValue, type PageValues } from "@/lib/cms/page-values";
import { Section, SectionHeading, InnerHero } from "@/components/ui/content";
import { NewsList } from "@/components/ui/NewsList";
export function NewsContent({ content = {} }: { content?: PageValues }) {
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "NewsContent.title.0",
          "Haberler & Duyurular",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "NewsContent.description.1",
          "İstikbal Aerospace’in kamuya açık açıklamaları ve teknoloji paylaşımları.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "NewsContent.image.2",
          "hero-hangar-photo.webp",
          "image",
          "Görsel",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "NewsContent.kicker.3",
            "ŞİRKET PAYLAŞIMLARI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "NewsContent.title.4",
            "Teknoloji gündemi.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "NewsContent.lead.5",
            "İstikbal Aerospace’in kamuya açık teknoloji tanıtımlarından seçilen içerikler. Paylaşım ve duyurular ayrı kategorilerde izlenebilir.",
            "text",
            "Açıklama",
          )}
        />
        <NewsList content={content} />
      </Section>
    </>
  );
}
