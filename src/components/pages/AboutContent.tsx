import {
  Section,
  SectionHeading,
  InnerHero,
  FocusModule,
} from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards } from "@/data/cards";

export function AboutContent() {
  return (
    <>
      <InnerHero
        title={"Kurumsal"}
        description={
          "Havacılık, gömülü sistemler ve otonom yazılım odağında disiplinler arası mühendislik."
        }
        image={"hero-hangar-photo.webp"}
        breadcrumb={"KURUMSAL"}
        kicker={"İSTİKBAL AEROSPACE"}
      />
      <Section>
        <SectionHeading
          kicker={"HAKKIMIZDA"}
          title={"Fikirden çalışan sisteme."}
          lead={
            "İstikbal Aerospace, Antalya / Kepez merkezli; havacılık, uzay ve savunma teknolojilerine yönelik alt sistemler, gömülü elektronik ve otonom yazılım çalışmalarına odaklanan bir teknoloji ve AR-GE girişimidir."
          }
        />
        <div className={"split-feature"}>
          <div
            className={"visual"}
            style={{ backgroundImage: "url('/assets/research-lab.svg')" }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>{"MÜHENDİSLİK YAKLAŞIMI"}</span>
            <h2>{"Donanım, yazılım ve otonomi bir arada."}</h2>
            <p>
              {
                "Elektronik tasarım, gömülü uçuş mimarileri ve otonom algoritmalar birbirinden bağımsız parçalar değildir. İstikbal Aerospace, kamuya açık kurumsal tanıtımında bu disiplinleri birlikte ele alan, çevik ve prototip geliştirmeye odaklı bir mühendislik yaklaşımı benimsediğini ifade eder."
              }
            </p>
            <p>
              {
                "Yaklaşımın odağında, kavramsal tasarımların donanım ve yazılımla buluşturulması; alt sistemlerin birlikte çalışabilir, incelenebilir ve test edilebilir yapılar olarak değerlendirilmesi bulunur."
              }
            </p>
          </div>
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={"ÇALIŞMA YAKLAŞIMI"}
          title={"Tasarım. Prototipleme. Entegrasyon."}
          lead={
            "İstikbal Aerospace’in kamuya açık tanıtımında öne çıkan mühendislik süreçleri."
          }
        />
        <div className={"focus-modules"}>
          <FocusModule
            number={"01 / 03"}
            title={"Sistem Tasarımı"}
            description={
              "Elektronik donanım, uçuş mimarileri ve yazılım bileşenlerini ortak bir sistem çerçevesinde değerlendirme."
            }
          />
          <FocusModule
            number={"02 / 03"}
            title={"Hızlı Prototipleme"}
            description={
              "Kavramsal fikirlerin elektronik tasarım, gömülü yazılım ve algoritma geliştirmeyle somutlaştırılması."
            }
          />
          <FocusModule
            number={"03 / 03"}
            title={"Entegrasyon"}
            description={
              "Farklı bileşenler arasında veri akışı, kontrol ve sistem davranışının bütün olarak ele alınması."
            }
          />
        </div>
      </Section>
      <Section>
        <SectionHeading
          kicker={"FAALİYET ALANLARI"}
          title={"Birbirini tamamlayan mühendislik alanları."}
          lead={
            "Şirketin kamuya açık tanıtımlarında yer alan çalışma başlıklarını ilgili sayfalardan inceleyebilirsiniz."
          }
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
            <span className={"eyebrow"}>{"KONUM"}</span>
            <h2>{"Kepez, Antalya."}</h2>
          </div>
          <div>
            <p>
              {
                "İstikbal Aerospace’in kamuya açık şirket profilinde merkez konumu Kepez / Antalya olarak belirtilmektedir. İş birliği ve iletişim talepleri için iletişim sayfamıza ulaşabilirsiniz."
              }
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
