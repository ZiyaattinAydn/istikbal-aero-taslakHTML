import {
  pageValue,
  pageData,
  pageImageStyle,
  type PageValues,
} from "@/lib/cms/page-values";
import { SiteLink } from "@/components/ui/SiteLink";
import { Section, SectionHeading } from "@/components/ui/content";
import { TechnologyCard, PlatformCard } from "@/components/cards/Cards";
import { cards as basecards } from "@/data/cards";
import { Hero } from "@/components/home/Hero";

export function HomeContent({ content = {} }: { content?: PageValues }) {
  const cards = pageData(basecards, "cards", content);
  return (
    <>
      <Hero content={content} />
      {"\n"}
      <Section>
        <div id={"homepage-intro"} className={"intro"}>
          <div>
            <span className={"eyebrow"}>
              {pageValue(
                content,
                "HomeContent.text.0",
                "SİSTEM MÜHENDİSLİĞİ",
                "text",
                "Metin",
              )}
            </span>
            <p className={"intro-quote"}>
              {pageValue(
                content,
                "HomeContent.text.1",
                "Gömülü elektronik.",
                "text",
                "Metin",
              )}
              <br />
              {pageValue(
                content,
                "HomeContent.text.2",
                "Otonom hareket.",
                "text",
                "Metin",
              )}
              <br />
              {pageValue(
                content,
                "HomeContent.text.3",
                "Entegre sistemler.",
                "text",
                "Metin",
              )}
            </p>
            <div className={"stat-lines"}>
              <span>
                {pageValue(
                  content,
                  "HomeContent.text.4",
                  "DONANIM",
                  "text",
                  "Metin",
                )}
              </span>
              <span>
                {pageValue(
                  content,
                  "HomeContent.text.5",
                  "YAZILIM",
                  "text",
                  "Metin",
                )}
              </span>
              <span>
                {pageValue(
                  content,
                  "HomeContent.text.6",
                  "SİSTEM ENTEGRASYONU",
                  "text",
                  "Metin",
                )}
              </span>
            </div>
          </div>
          <div className={"intro-copy"}>
            <strong>
              {pageValue(
                content,
                "HomeContent.text.7",
                "Birbiriyle çalışan teknolojiler.",
                "text",
                "Metin",
              )}
            </strong>
            <br />
            {pageValue(
              content,
              "HomeContent.text.8",
              "İstikbal Aerospace; insansız hava araçları, PCB tasarımı, gömülü sistemler ve otonom algoritmalar çevresinde şekillenen mühendislik alanlarına odaklanıyor. Sensörlerden elde edilen verinin işlenmesinden sistem düzeyinde entegrasyona kadar uzanan bir teknoloji yaklaşımı.",
              "text",
              "Metin",
            )}
          </div>
        </div>
      </Section>
      {"\n"}
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "HomeContent.kicker.9",
            "01 / HAVA & SİSTEMLER",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "HomeContent.title.10",
            "Havacılığın farklı katmanları.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "HomeContent.lead.11",
            "İnsansız hava platformlarından uçuş elektroniğine, bağlantılı sistem mimarilerinden otonom çözümlere uzanan çalışma alanları.",
            "text",
            "Açıklama",
          )}
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
          kicker={pageValue(
            content,
            "HomeContent.kicker.12",
            "02 / TEKNOLOJİLER",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "HomeContent.title.13",
            "Sistemin ardındaki mühendislik.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "HomeContent.lead.14",
            "Elektronik tasarımdan verinin birleştirilmesine uzanan temel çalışma alanları.",
            "text",
            "Açıklama",
          )}
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
              {pageValue(
                content,
                "HomeContent.text.15",
                "03 / YAPAY ZEKÂ VE KOMUTA KONTROL",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "HomeContent.text.16",
                "TENGRİ AI",
                "text",
                "Metin",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "HomeContent.text.17",
                "Hava ve kara sistemlerinin koordinasyonuna yönelik yapay zekâ temelli savunma ağı yaklaşımı. Algılama, tehdit değerlendirme ve karar destek katmanları üzerine çalışmalar.",
                "text",
                "Metin",
              )}
            </p>
            <div style={{ marginBottom: "27px" }} className={"tengri-outline"}>
              {pageValue(
                content,
                "HomeContent.text.18",
                "YAPAY ZEKÂ · AĞ MİMARİLERİ · KARAR DESTEK",
                "text",
                "Metin",
              )}
            </div>
            <SiteLink
              className={"btn solid"}
              href={pageValue(
                content,
                "HomeContent.href.19",
                "tengri-ai.html",
                "link",
                "Bağlantı",
              )}
            >
              {pageValue(
                content,
                "HomeContent.text.20",
                "Tengri AI",
                "text",
                "Metin",
              )}
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
          kicker={pageValue(
            content,
            "HomeContent.kicker.21",
            "04 / PROJELER & AR-GE",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "HomeContent.title.22",
            "Araştırmadan uygulamaya.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "HomeContent.lead.23",
            "PCB tasarımı, otonom hareket mühendisliği ve gömülü donanım gibi alanlarda araştırma ve geliştirme yaklaşımı.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"split-feature"}>
          <div
            className={"visual"}
            data-cms-field="HomeContent.image.24"
            style={{
              backgroundImage: pageImageStyle(
                content,
                "HomeContent.image.24",
                "research-lab.svg",
              )!.backgroundImage,
            }}
          ></div>
          <div className={"copy"}>
            <span className={"tag cool"}>
              {pageValue(
                content,
                "HomeContent.text.25",
                "AR-GE & ELEKTRONİK",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "HomeContent.text.26",
                "Sistemler, detaylarda şekillenir.",
                "text",
                "Metin",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "HomeContent.text.27",
                "Elektronik donanım, gömülü yazılım ve otonom kontrolün birbirini tamamlayan disiplinler olarak ele alındığı mühendislik alanları.",
                "text",
                "Metin",
              )}
            </p>
          </div>
        </div>
      </Section>
      {"\n"}
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={pageValue(
            content,
            "HomeContent.kicker.28",
            "05 / HABERLER & DUYURULAR",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "HomeContent.title.29",
            "Kamuya açık gelişmeler.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "HomeContent.lead.30",
            "Şirketin paylaştığı teknoloji çalışmalarına ve duyurularına göz atın.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"news-feature"}>
          <div
            className={"news-feature-art"}
            data-cms-field="HomeContent.image.31"
            style={{
              backgroundImage: pageImageStyle(
                content,
                "HomeContent.image.31",
                "tengri-network.svg",
              )!.backgroundImage,
            }}
          ></div>
          <div className={"news-feature-copy"}>
            <span className={"eyebrow no-rule"}>
              {pageValue(
                content,
                "HomeContent.text.32",
                "ŞİRKET PAYLAŞIMI / TENGRİ AI",
                "text",
                "Metin",
              )}
            </span>
            <h3>
              {pageValue(
                content,
                "HomeContent.text.33",
                "Tengri AI: Yapay zekâ destekli savunma ağı yaklaşımı",
                "text",
                "Metin",
              )}
            </h3>
            <p>
              {pageValue(
                content,
                "HomeContent.text.34",
                "İstikbal Aerospace tarafından kamuya açık olarak tanıtılan Tengri AI'ın odaklandığı teknoloji alanlarını keşfedin.",
                "text",
                "Metin",
              )}
            </p>
            <SiteLink
              className={"btn text"}
              href={pageValue(
                content,
                "HomeContent.href.35",
                "haber-detay.html",
                "link",
                "Bağlantı",
              )}
            >
              {pageValue(
                content,
                "HomeContent.text.36",
                "Gelişmeyi İncele",
                "text",
                "Metin",
              )}
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
            data-cms-field="HomeContent.image.37"
            style={{
              backgroundImage: pageImageStyle(
                content,
                "HomeContent.image.37",
                "hero-hangar-photo.webp",
              )!.backgroundImage,
            }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>
              {pageValue(
                content,
                "HomeContent.text.38",
                "06 / İSTİKBAL AEROSPACE",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "HomeContent.text.39",
                "Antalya'dan geleceğin teknolojilerine.",
                "text",
                "Metin",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "HomeContent.text.40",
                "Antalya merkezli İstikbal Aerospace; havacılık, gömülü elektronik, PCB tasarımı ve otonom sistem mühendisliğini bir araya getiren çalışmalar yürütür.",
                "text",
                "Metin",
              )}
            </p>
          </div>
        </div>
      </Section>
      {"\n"}
    </>
  );
}
