import { Section, InnerHero, FeatureRow } from "@/components/ui/content";

export function ProjectDetailContent() {
  return (
    <>
      <InnerHero
        title={"AR-GE"}
        description={"Elektronik tasarım ve otonom mühendislik çalışmaları."}
        image={"research-lab.svg"}
        breadcrumb={"AR-GE"}
        kicker={"İSTİKBAL AEROSPACE"}
      />
      <Section>
        <FeatureRow
          title={"Mühendislik disiplinleri."}
          kicker={"SİSTEM ALANLARI"}
          description={
            "İstikbal Aerospace’in gömülü donanım, otonom sistemler ve mühendislik çalışma alanları birlikte ele alınır."
          }
          image={"research-lab.svg"}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
    </>
  );
}
