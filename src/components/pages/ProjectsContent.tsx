import { pageValue, pageData, type PageValues } from "@/lib/cms/page-values";
import { Section, SectionHeading, InnerHero } from "@/components/ui/content";
import { TechnologyCard, NewsCard } from "@/components/cards/Cards";
import { publicWorks as basepublicWorks } from "@/data/publications";
import { cards as basecards } from "@/data/cards";

export function ProjectsContent({ content = {} }: { content?: PageValues }) {
  const cards = pageData(basecards, "cards", content);
  const publicWorks = pageData(basepublicWorks, "publicWorks", content);
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "ProjectsContent.title.0",
          "Projeler & AR-GE",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "ProjectsContent.description.1",
          "Kamuya açık teknoloji tanıtımları ve mühendislik çalışma alanları.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "ProjectsContent.image.2",
          "research-lab.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "ProjectsContent.breadcrumb.3",
          "PROJELER & AR-GE",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "ProjectsContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "ProjectsContent.kicker.5",
            "KAMUYA AÇIK ÇALIŞMALAR",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "ProjectsContent.title.6",
            "Teknoloji fikirlerinden paylaşılan çalışmalara.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "ProjectsContent.lead.7",
            "İstikbal Aerospace’in kamuya açık tanıtımlarında yer alan çalışmalar. Geliştirme ve test aşamalarına ilişkin ayrıntılar şirket onayına bağlıdır.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"cards-3 editorial-grid"}>
          <>
            {publicWorks.map((work) => (
              <NewsCard
                key={work.id}
                {...work}
                description={work.summary}
                linkLabel="Çalışmayı İncele"
              />
            ))}
          </>
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={pageValue(
            content,
            "ProjectsContent.kicker.8",
            "AR-GE DİSİPLİNLERİ",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "ProjectsContent.title.9",
            "Elektronikten sisteme.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "ProjectsContent.lead.10",
            "Kurumsal faaliyet tanıtımında yer alan çalışma alanları; bunlar tek başına tamamlanmış projeler olarak listelenmemektedir.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"cards-3"}>
          <TechnologyCard {...cards.technology[16]} />
          <TechnologyCard {...cards.technology[17]} />
          <TechnologyCard {...cards.technology[18]} />
        </div>
      </Section>
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "ProjectsContent.kicker.11",
            "MÜHENDİSLİK YAKLAŞIMI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "ProjectsContent.title.12",
            "Araştırma, uygulama, bütünleştirme.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "ProjectsContent.lead.13",
            "Fikirlerin donanım ve yazılımla buluştuğu sistem geliştirme adımları. PCB tasarımı ve gömülü yazılımın uçuş elektroniğiyle kurduğu ilişki bütünleşik sistem yaklaşımının parçasıdır.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"steps"}>
          <div className={"step"}>
            <span className={"n"}>{"01"}</span>
            <h3>
              {pageValue(
                content,
                "ProjectsContent.text.14",
                "İhtiyaç Analizi",
                "text",
                "Metin",
              )}
            </h3>
            <p>
              {pageValue(
                content,
                "ProjectsContent.text.15",
                "Görev ve sistem gereksinimlerinin belirlenmesi.",
                "text",
                "Metin",
              )}
            </p>
          </div>
          <div className={"step"}>
            <span className={"n"}>{"02"}</span>
            <h3>
              {pageValue(
                content,
                "ProjectsContent.text.16",
                "Elektronik Tasarım",
                "text",
                "Metin",
              )}
            </h3>
            <p>
              {pageValue(
                content,
                "ProjectsContent.text.17",
                "Donanım ve arayüzlerin tasarlanması.",
                "text",
                "Metin",
              )}
            </p>
          </div>
          <div className={"step"}>
            <span className={"n"}>{"03"}</span>
            <h3>
              {pageValue(
                content,
                "ProjectsContent.text.18",
                "Yazılım & Kontrol",
                "text",
                "Metin",
              )}
            </h3>
            <p>
              {pageValue(
                content,
                "ProjectsContent.text.19",
                "Gömülü yazılım ve kontrol algoritmalarının geliştirilmesi.",
                "text",
                "Metin",
              )}
            </p>
          </div>
          <div className={"step"}>
            <span className={"n"}>{"04"}</span>
            <h3>
              {pageValue(
                content,
                "ProjectsContent.text.20",
                "Sistem Entegrasyonu",
                "text",
                "Metin",
              )}
            </h3>
            <p>
              {pageValue(
                content,
                "ProjectsContent.text.21",
                "Alt sistemlerin birlikte değerlendirilmesi.",
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
