import { SiteLink } from "@/components/ui/SiteLink";
import { Section, SectionHeading } from "@/components/ui/content";
import { TechnologyCard, PlatformCard } from "@/components/cards/Cards";
import { cards } from "@/data/cards";
import { Hero } from "@/components/home/Hero";

export function HomeContent() {
  return (
    <>
      <Hero />
      {"\n"}
      <Section>
        <div id={"homepage-intro"} className={"intro"}>
          <div>
            <span className={"eyebrow"}>{"SİSTEM MÜHENDİSLİĞİ"}</span>
            <p className={"intro-quote"}>
              {"Gömülü elektronik."}
              <br />
              {"Otonom hareket."}
              <br />
              {"Entegre sistemler."}
            </p>
            <div className={"stat-lines"}>
              <span>{"DONANIM"}</span>
              <span>{"YAZILIM"}</span>
              <span>{"SİSTEM ENTEGRASYONU"}</span>
            </div>
          </div>
          <div className={"intro-copy"}>
            <strong>{"Birbiriyle çalışan teknolojiler."}</strong>
            <br />
            {
              "İstikbal Aerospace; insansız hava araçları, PCB tasarımı, gömülü sistemler ve otonom algoritmalar çevresinde şekillenen mühendislik alanlarına odaklanıyor. Sensörlerden elde edilen verinin işlenmesinden sistem düzeyinde entegrasyona kadar uzanan bir teknoloji yaklaşımı."
            }
          </div>
        </div>
      </Section>
      {"\n"}
      <Section>
        <SectionHeading
          kicker={"01 / HAVA & SİSTEMLER"}
          title={"Havacılığın farklı katmanları."}
          lead={
            "İnsansız hava platformlarından uçuş elektroniğine, bağlantılı sistem mimarilerinden otonom çözümlere uzanan çalışma alanları."
          }
        />
        <div className={"platform-grid"}>
          <PlatformCard {...cards.platform[0]} />
          <PlatformCard {...cards.platform[1]} />
          <PlatformCard {...cards.platform[2]} />
        </div>
      </Section>
      {"\n"}
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={"02 / TEKNOLOJİLER"}
          title={"Sistemin ardındaki mühendislik."}
          lead={
            "Elektronik tasarımdan verinin birleştirilmesine uzanan temel çalışma alanları."
          }
        />
        <div className={"cards-2"}>
          <TechnologyCard {...cards.technology[0]} />
          <TechnologyCard {...cards.technology[1]} />
          <TechnologyCard {...cards.technology[2]} />
          <TechnologyCard {...cards.technology[3]} />
        </div>
      </Section>
      {"\n"}
      <section className={"tengri-band"}>
        <div className={"tengri-visual"} aria-hidden={"true"}>
          <i className={"signal-ring"}></i>
          <i className={"signal-trace"}></i>
        </div>
        <div className={"tengri-shade"}></div>
        <div className={"wrapper"}>
          <div className={"tengri-inner"}>
            <span className={"eyebrow"}>
              {"03 / YAPAY ZEKÂ VE KOMUTA KONTROL"}
            </span>
            <h2>{"TENGRİ AI"}</h2>
            <p>
              {
                "Hava ve kara sistemlerinin koordinasyonuna yönelik yapay zekâ temelli savunma ağı yaklaşımı. Algılama, tehdit değerlendirme ve karar destek katmanları üzerine çalışmalar."
              }
            </p>
            <div style={{ marginBottom: "27px" }} className={"tengri-outline"}>
              {"YAPAY ZEKÂ · AĞ MİMARİLERİ · KARAR DESTEK"}
            </div>
            <SiteLink className={"btn solid"} href={"tengri-ai.html"}>
              {"Tengri AI"}
              <span className={"arrow"} aria-hidden={"true"}>
                {"↗"}
              </span>
            </SiteLink>
          </div>
        </div>
      </section>
      {"\n"}
      <Section>
        <SectionHeading
          kicker={"04 / PROJELER & AR-GE"}
          title={"Araştırmadan uygulamaya."}
          lead={
            "PCB tasarımı, otonom hareket mühendisliği ve gömülü donanım gibi alanlarda araştırma ve geliştirme yaklaşımı."
          }
        />
        <div className={"split-feature"}>
          <div
            className={"visual"}
            style={{ backgroundImage: "url('/assets/research-lab.svg')" }}
          ></div>
          <div className={"copy"}>
            <span className={"tag cool"}>{"AR-GE & ELEKTRONİK"}</span>
            <h2>{"Sistemler, detaylarda şekillenir."}</h2>
            <p>
              {
                "Elektronik donanım, gömülü yazılım ve otonom kontrolün birbirini tamamlayan disiplinler olarak ele alındığı mühendislik alanları."
              }
            </p>
          </div>
        </div>
      </Section>
      {"\n"}
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={"05 / HABERLER & DUYURULAR"}
          title={"Kamuya açık gelişmeler."}
          lead={
            "Şirketin paylaştığı teknoloji çalışmalarına ve duyurularına göz atın."
          }
        />
        <div className={"news-feature"}>
          <div
            className={"news-feature-art"}
            style={{ backgroundImage: "url('/assets/tengri-network.svg')" }}
          ></div>
          <div className={"news-feature-copy"}>
            <span className={"eyebrow no-rule"}>
              {"ŞİRKET PAYLAŞIMI / TENGRİ AI"}
            </span>
            <h3>{"Tengri AI: Yapay zekâ destekli savunma ağı yaklaşımı"}</h3>
            <p>
              {
                "İstikbal Aerospace tarafından kamuya açık olarak tanıtılan Tengri AI'ın odaklandığı teknoloji alanlarını keşfedin."
              }
            </p>
            <SiteLink className={"btn text"} href={"haber-detay.html"}>
              {"Gelişmeyi İncele"}
              <span className={"arrow"} aria-hidden={"true"}>
                {"↗"}
              </span>
            </SiteLink>
          </div>
        </div>
      </Section>
      {"\n"}
      <Section>
        <div className={"split-feature reverse"}>
          <div
            className={"visual"}
            style={{ backgroundImage: "url('/assets/hero-hangar-photo.webp')" }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>
              {"06 / İSTİKBAL AEROSPACE"}
            </span>
            <h2>{"Antalya'dan geleceğin teknolojilerine."}</h2>
            <p>
              {
                "Antalya merkezli İstikbal Aerospace; havacılık, gömülü elektronik, PCB tasarımı ve otonom sistem mühendisliğini bir araya getiren çalışmalar yürütür."
              }
            </p>
          </div>
        </div>
      </Section>
      {"\n"}
    </>
  );
}
