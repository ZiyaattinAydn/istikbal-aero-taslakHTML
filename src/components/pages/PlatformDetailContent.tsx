import { pageValue, type PageValues } from "@/lib/cms/page-values";
import { Section, InnerHero, FeatureRow } from "@/components/ui/content";

export function PlatformDetailContent({
  content = {},
}: {
  content?: PageValues;
}) {
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "PlatformDetailContent.title.0",
          "Havacılık Sistemleri",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "PlatformDetailContent.description.1",
          "Platform mühendisliği, uçuş elektroniği ve sistem entegrasyonu.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "PlatformDetailContent.image.2",
          "platform-flight.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "PlatformDetailContent.breadcrumb.3",
          "HAVACILIK SISTEMLERI",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "PlatformDetailContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <FeatureRow
          title={pageValue(
            content,
            "PlatformDetailContent.title.5",
            "Mühendislik disiplinleri.",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "PlatformDetailContent.kicker.6",
            "SİSTEM ALANLARI",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "PlatformDetailContent.description.7",
            "İstikbal Aerospace’in gömülü donanım, otonom sistemler ve mühendislik çalışma alanları birlikte ele alınır.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "PlatformDetailContent.image.8",
            "platform-flight.svg",
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
