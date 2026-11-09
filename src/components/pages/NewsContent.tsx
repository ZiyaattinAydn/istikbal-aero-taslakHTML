import { Section, SectionHeading, InnerHero } from "@/components/ui/content";
import { NewsList } from "@/components/ui/NewsList";
export function NewsContent() {
  return (
    <>
      <InnerHero
        title="Haberler & Duyurular"
        description="İstikbal Aerospace’in kamuya açık açıklamaları ve teknoloji paylaşımları."
        image="hero-hangar-photo.webp"
      />
      <Section>
        <SectionHeading
          kicker="ŞİRKET PAYLAŞIMLARI"
          title="Teknoloji gündemi."
          lead="İstikbal Aerospace’in kamuya açık teknoloji tanıtımlarından seçilen içerikler. Paylaşım ve duyurular ayrı kategorilerde izlenebilir."
        />
        <NewsList />
      </Section>
    </>
  );
}
