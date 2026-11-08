import { Section, InnerHero, FeatureRow } from "@/components/ui/content";

export function PlatformDetailContent() {
  return (
    <>
      <InnerHero
        title={"Havacılık Sistemleri"}
        description={
          "Platform mühendisliği, uçuş elektroniği ve sistem entegrasyonu."
        }
        image={"platform-flight.svg"}
        breadcrumb={"HAVACILIK SISTEMLERI"}
        kicker={"İSTİKBAL AEROSPACE"}
      />
      <Section>
        <FeatureRow
          title={"Mühendislik disiplinleri."}
          kicker={"SİSTEM ALANLARI"}
          description={
            "İstikbal Aerospace’in gömülü donanım, otonom sistemler ve mühendislik çalışma alanları birlikte ele alınır."
          }
          image={"platform-flight.svg"}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
    </>
  );
}
