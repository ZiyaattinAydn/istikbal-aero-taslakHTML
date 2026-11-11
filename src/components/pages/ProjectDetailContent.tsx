import { pageValue, type PageValues } from "@/lib/cms/page-values";
import { Section, InnerHero, FeatureRow } from "@/components/ui/content";

export function ProjectDetailContent({
  content = {},
}: {
  content?: PageValues;
}) {
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "ProjectDetailContent.title.0",
          "AR-GE",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "ProjectDetailContent.description.1",
          "Elektronik tasarım ve otonom mühendislik çalışmaları.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "ProjectDetailContent.image.2",
          "research-lab.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "ProjectDetailContent.breadcrumb.3",
          "AR-GE",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "ProjectDetailContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <FeatureRow
          title={pageValue(
            content,
            "ProjectDetailContent.title.5",
            "Mühendislik disiplinleri.",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "ProjectDetailContent.kicker.6",
            "SİSTEM ALANLARI",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "ProjectDetailContent.description.7",
            "İstikbal Aerospace’in gömülü donanım, otonom sistemler ve mühendislik çalışma alanları birlikte ele alınır.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "ProjectDetailContent.image.8",
            "research-lab.svg",
            "image",
            "Görsel",
          )}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
    </>
  );
}
