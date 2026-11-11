import { pageValue, pageData, type PageValues } from "@/lib/cms/page-values";
import { focusData, platformFocusData } from "@/data/focus";
import {
  Section,
  SectionHeading,
  InnerHero,
  FocusModule,
} from "@/components/ui/content";
export function FocusContent({
  name,
  content = {},
}: {
  name: keyof typeof focusData;
  content?: PageValues;
}) {
  const x = pageData(focusData[name], `focus.${name}`, content);
  return (
    <>
      <InnerHero
        title={x.title}
        description={x.tagline}
        image={x.bg}
        breadcrumb={"TEKNOLOJİLER / " + x.title.toUpperCase()}
        kicker={x.kicker}
      />
      <Section>
        <div className="focus-intro">
          <div>
            <span className="eyebrow">
              {pageValue(
                content,
                "FocusContent.text.0",
                "TEKNOLOJİYE YAKINDAN BAKIŞ",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "FocusContent.text.1",
                "Bir disiplinin farklı katmanları.",
              )}
            </h2>
          </div>
          <p>{x.intro}</p>
        </div>
      </Section>
      <Section className="inner-panel">
        <SectionHeading
          kicker={pageValue(
            content,
            "FocusContent.kicker.2",
            "TEMEL YAKLAŞIM",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "FocusContent.title.3",
            "Mühendislik bileşenleri.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "FocusContent.lead.4",
            "Konuya ait kavramlar ve çalışma ilkeleri; doğrulanmış proje bilgileri ayrıca yayınlanacaktır.",
            "text",
            "Açıklama",
          )}
        />
        <div className="focus-modules">
          {x.modules.map(([number, title, description]) => (
            <FocusModule
              key={number}
              number={`${number} / 03`}
              title={title}
              description={description}
            />
          ))}
        </div>
        <p className="editorial-note">
          {pageValue(
            content,
            "FocusContent.text.5",
            "Sistemler birlikte çalışır: ",
          )}
          {x.title} {pageValue(content, "FocusContent.text.6", " ile ")}
          {x.related}{" "}
          {pageValue(
            content,
            "FocusContent.text.7",
            " birbirini tamamlayan mühendislik alanlarıdır. Teknoloji başlıkları birbirinden bağımsız değildir.",
          )}
        </p>
      </Section>
    </>
  );
}
export function PlatformFocusContent({
  name,
  content = {},
}: {
  content?: PageValues;
  name: keyof typeof platformFocusData;
}) {
  const x = pageData(platformFocusData[name], `platformFocus.${name}`, content);
  return (
    <>
      <InnerHero
        title={x.title}
        description={x.description}
        image={x.image}
        breadcrumb={"PLATFORMLAR / " + x.title.toUpperCase()}
        kicker={x.kicker}
      />
      <Section>
        <div className="focus-intro">
          <div>
            <span className="eyebrow">
              {pageValue(content, "FocusContent.text.8", "SİSTEM ODAĞI")}
            </span>
            <h2>
              {pageValue(
                content,
                "FocusContent.text.9",
                "Birlikte çalışan teknolojiler.",
              )}
            </h2>
          </div>
          <p>{x.intro}</p>
        </div>
      </Section>
      <Section className="inner-panel">
        <SectionHeading
          kicker={pageValue(
            content,
            "FocusContent.kicker.10",
            "MÜHENDİSLİK KATMANLARI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "FocusContent.title.11",
            "Sistem bütünlüğü.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "FocusContent.lead.12",
            "Havacılık çalışmalarında birbirini tamamlayan temel mühendislik başlıkları.",
            "text",
            "Açıklama",
          )}
        />
        <div className="focus-modules">
          {x.modules.map(([title, description], index) => (
            <FocusModule
              key={title}
              number={`0${index + 1} / 03`}
              title={title}
              description={description}
            />
          ))}
        </div>
        <p className="editorial-note">
          {pageValue(
            content,
            "FocusContent.text.13",
            "Otonom sistemler, gömülü donanım ve sensör füzyonu bu mimarilerle ilişkili mühendislik disiplinleridir.",
          )}
        </p>
      </Section>
    </>
  );
}
