import {
  pageValue,
  pageData,
  pageImageStyle,
  type PageValues,
} from "@/lib/cms/page-values";
import {
  Section,
  SectionHeading,
  InnerHero,
  FocusModule,
} from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards as basecards } from "@/data/cards";

export function AboutContent({ content = {} }: { content?: PageValues }) {
  const cards = pageData(basecards, "cards", content);
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "AboutContent.title.0",
          "Kurumsal",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "AboutContent.description.1",
          "Havacılık, gömülü sistemler ve otonom yazılım odağında disiplinler arası mühendislik.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "AboutContent.image.2",
          "hero-hangar-photo.webp",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "AboutContent.breadcrumb.3",
          "KURUMSAL",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "AboutContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "AboutContent.kicker.5",
            "HAKKIMIZDA",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "AboutContent.title.6",
            "Fikirden çalışan sisteme.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "AboutContent.lead.7",
            "İstikbal Aerospace, Antalya / Kepez merkezli; havacılık, uzay ve savunma teknolojilerine yönelik alt sistemler, gömülü elektronik ve otonom yazılım çalışmalarına odaklanan bir teknoloji ve AR-GE girişimidir.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"split-feature"}>
          <div
            className={"visual"}
            data-cms-field="AboutContent.image.8"
            style={{
              backgroundImage: pageImageStyle(
                content,
                "AboutContent.image.8",
                "research-lab.svg",
              )!.backgroundImage,
            }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>
              {pageValue(
                content,
                "AboutContent.text.9",
                "MÜHENDİSLİK YAKLAŞIMI",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "AboutContent.text.10",
                "Donanım, yazılım ve otonomi bir arada.",
                "text",
                "Metin",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "AboutContent.text.11",
                "Elektronik tasarım, gömülü uçuş mimarileri ve otonom algoritmalar birbirinden bağımsız parçalar değildir. İstikbal Aerospace, kamuya açık kurumsal tanıtımında bu disiplinleri birlikte ele alan, çevik ve prototip geliştirmeye odaklı bir mühendislik yaklaşımı benimsediğini ifade eder.",
                "text",
                "Metin",
              )}
            </p>
            <p>
              {pageValue(
                content,
                "AboutContent.text.12",
                "Yaklaşımın odağında, kavramsal tasarımların donanım ve yazılımla buluşturulması; alt sistemlerin birlikte çalışabilir, incelenebilir ve test edilebilir yapılar olarak değerlendirilmesi bulunur.",
                "text",
                "Metin",
              )}
            </p>
          </div>
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={pageValue(
            content,
            "AboutContent.kicker.13",
            "ÇALIŞMA YAKLAŞIMI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "AboutContent.title.14",
            "Tasarım. Prototipleme. Entegrasyon.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "AboutContent.lead.15",
            "İstikbal Aerospace’in kamuya açık tanıtımında öne çıkan mühendislik süreçleri.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"focus-modules"}>
          <FocusModule
            number={"01 / 03"}
            title={pageValue(
              content,
              "AboutContent.title.16",
              "Sistem Tasarımı",
              "text",
              "Başlık",
            )}
            description={pageValue(
              content,
              "AboutContent.description.17",
              "Elektronik donanım, uçuş mimarileri ve yazılım bileşenlerini ortak bir sistem çerçevesinde değerlendirme.",
              "text",
              "Açıklama",
            )}
          />
          <FocusModule
            number={"02 / 03"}
            title={pageValue(
              content,
              "AboutContent.title.18",
              "Hızlı Prototipleme",
              "text",
              "Başlık",
            )}
            description={pageValue(
              content,
              "AboutContent.description.19",
              "Kavramsal fikirlerin elektronik tasarım, gömülü yazılım ve algoritma geliştirmeyle somutlaştırılması.",
              "text",
              "Açıklama",
            )}
          />
          <FocusModule
            number={"03 / 03"}
            title={pageValue(
              content,
              "AboutContent.title.20",
              "Entegrasyon",
              "text",
              "Başlık",
            )}
            description={pageValue(
              content,
              "AboutContent.description.21",
              "Farklı bileşenler arasında veri akışı, kontrol ve sistem davranışının bütün olarak ele alınması.",
              "text",
              "Açıklama",
            )}
          />
        </div>
      </Section>
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "AboutContent.kicker.22",
            "FAALİYET ALANLARI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "AboutContent.title.23",
            "Birbirini tamamlayan mühendislik alanları.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "AboutContent.lead.24",
            "Şirketin kamuya açık tanıtımlarında yer alan çalışma başlıklarını ilgili sayfalardan inceleyebilirsiniz.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"cards-3"}>
          <TechnologyCard {...cards.technology[10]} />
          <TechnologyCard {...cards.technology[11]} />
          <TechnologyCard {...cards.technology[12]} />
        </div>
      </Section>
      <Section>
        <div className={"corporate-identity"}>
          <div>
            <span className={"eyebrow"}>
              {pageValue(
                content,
                "AboutContent.text.25",
                "KONUM",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "AboutContent.text.26",
                "Kepez, Antalya.",
                "text",
                "Metin",
              )}
            </h2>
          </div>
          <div>
            <p>
              {pageValue(
                content,
                "AboutContent.text.27",
                "İstikbal Aerospace’in kamuya açık şirket profilinde merkez konumu Kepez / Antalya olarak belirtilmektedir. İş birliği ve iletişim talepleri için iletişim sayfamıza ulaşabilirsiniz.",
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
