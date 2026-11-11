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
  FeatureRow,
  FocusModule,
} from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards as basecards } from "@/data/cards";

export function TengriContent({ content = {} }: { content?: PageValues }) {
  const cards = pageData(basecards, "cards", content);
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "TengriContent.title.0",
          "TENGRİ AI",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "TengriContent.description.1",
          "Çok katmanlı yapay zekâ, durumsal farkındalık ve bağlantılı savunma sistemleri vizyonu.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "TengriContent.image.2",
          "tengri-network.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "TengriContent.breadcrumb.3",
          "TEKNOLOJİLER / TENGRİ AI",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "TengriContent.kicker.4",
          "YAPAY ZEKÂ / KARAR DESTEK",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "TengriContent.kicker.5",
            "TENGRİ AI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "TengriContent.title.6",
            "Birden fazla sistem. Ortak bir karar resmi.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "TengriContent.lead.7",
            "Tengri AI; hava savunma ağları, insansız sistemler, roket teknolojileri ve haberleşme altyapılarının birlikte ele alındığı çok katmanlı bir yapay zekâ ve karar destek vizyonudur.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"split-feature"}>
          <div
            className={"visual"}
            style={{
              backgroundImage: pageImageStyle(
                content,
                "TengriContent.image.8",
                "tengri-network.svg",
              )!.backgroundImage,
            }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>
              {pageValue(
                content,
                "TengriContent.text.9",
                "AĞ MERKEZLİ YAPAY ZEKÂ",
                "text",
                "Metin",
              )}
            </span>
            <h2>
              {pageValue(
                content,
                "TengriContent.text.10",
                "Veriyi anlamlandıran, sistemleri buluşturan yaklaşım.",
                "text",
                "Metin",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "TengriContent.text.11",
                "Tengri AI’ın odağında sensör ve platform verilerinden durumsal farkındalık oluşturulması, tehditlerin değerlendirilmesi ve karar süreçlerinin desteklenmesi yer alır. Amaç, birbirinden ayrı sistemleri daha bütünlüklü bir bilgi ve koordinasyon yapısı içinde değerlendirmektir.",
                "text",
                "Metin",
              )}
            </p>
            <p>
              {pageValue(
                content,
                "TengriContent.text.12",
                "Tasarımın temelinde çoklu kaynak verisi, tahmine dayalı analiz ve bağlantılı sistem mimarileri bulunur.",
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
            "TengriContent.kicker.13",
            "TANITIMDAKİ TEKNOLOJİ BAŞLIKLARI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "TengriContent.title.14",
            "Algılama. Değerlendirme. Koordinasyon.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "TengriContent.lead.15",
            "Tengri AI yaklaşımının temelini oluşturan teknoloji başlıkları.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"cards-3"}>
          <TechnologyCard {...cards.technology[25]} />
          <TechnologyCard {...cards.technology[26]} />
          <TechnologyCard {...cards.technology[27]} />
          <TechnologyCard {...cards.technology[28]} />
          <TechnologyCard {...cards.technology[29]} />
          <TechnologyCard {...cards.technology[30]} />
        </div>
      </Section>
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "TengriContent.kicker.16",
            "ENTEGRE SİSTEM YAKLAŞIMI",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "TengriContent.title.17",
            "Bağlantılı bir teknoloji ekosistemi.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "TengriContent.lead.18",
            "Tengri AI’ın kamuya açık vizyonunda farklı sistem ailelerinin ortak bir yapıda değerlendirilmesi hedefleniyor.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"focus-modules"}>
          <FocusModule
            number={"01 / 03"}
            title={pageValue(
              content,
              "TengriContent.title.19",
              "İnsansız Hava Platformları",
              "text",
              "Başlık",
            )}
            description={pageValue(
              content,
              "TengriContent.description.20",
              "Hava araçları ve uçuş sistemlerinin sağladığı verilerin daha geniş bir durum değerlendirmesine dahil edilmesi yaklaşımı.",
              "text",
              "Açıklama",
            )}
          />
          <FocusModule
            number={"02 / 03"}
            title={pageValue(
              content,
              "TengriContent.title.21",
              "Savunma Alt Sistemleri",
              "text",
              "Başlık",
            )}
            description={pageValue(
              content,
              "TengriContent.description.22",
              "Hava savunma ve roket sistemleri gibi farklı bileşenler arasında ortak bilgi ve koordinasyon gereksinimi.",
              "text",
              "Açıklama",
            )}
          />
          <FocusModule
            number={"03 / 03"}
            title={pageValue(
              content,
              "TengriContent.title.23",
              "Haberleşme Altyapısı",
              "text",
              "Başlık",
            )}
            description={pageValue(
              content,
              "TengriContent.description.24",
              "Bağlantılı birimler arasında bilgi aktarımı, veri bütünlüğü ve sistemler arası iletişim kavramları.",
              "text",
              "Açıklama",
            )}
          />
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <FeatureRow
          title={pageValue(
            content,
            "TengriContent.title.25",
            "Kritik alanlar için durumsal farkındalık.",
            "text",
            "Başlık",
          )}
          kicker={pageValue(
            content,
            "TengriContent.kicker.26",
            "VİZYON & KARAR DESTEK",
            "text",
            "Bölüm etiketi",
          )}
          description={pageValue(
            content,
            "TengriContent.description.27",
            "Kritik altyapılar, stratejik bölgeler ve olası tehdit senaryoları için durumsal farkındalık, önceliklendirme ve öngörüye dayalı değerlendirme bu teknoloji vizyonunun kullanım alanları arasında yer alır. Bunlar mevcut operasyonel yetenek olarak değil, hedeflenen çalışma alanları olarak ele alınmaktadır.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "TengriContent.image.28",
            "research-lab.svg",
            "image",
            "Görsel",
          )}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "TengriContent.kicker.29",
            "İLİŞKİLİ TEKNOLOJİLER",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "TengriContent.title.30",
            "Tengri AI ve sistem mühendisliği.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "TengriContent.lead.31",
            "Gömülü yazılım, sensör füzyonu, otonomi ve haberleşme; ağ bağlantılı yapay zekâ yaklaşımlarını tamamlayan mühendislik alanlarıdır.",
            "text",
            "Açıklama",
          )}
        />
      </Section>
    </>
  );
}
