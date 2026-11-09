import {
  Section,
  SectionHeading,
  InnerHero,
  FeatureRow,
  FocusModule,
} from "@/components/ui/content";
import { TechnologyCard } from "@/components/cards/Cards";
import { cards } from "@/data/cards";

export function TengriContent() {
  return (
    <>
      <InnerHero
        title={"TENGRİ AI"}
        description={
          "Çok katmanlı yapay zekâ, durumsal farkındalık ve bağlantılı savunma sistemleri vizyonu."
        }
        image={"tengri-network.svg"}
        breadcrumb={"TEKNOLOJİLER / TENGRİ AI"}
        kicker={"YAPAY ZEKÂ / KARAR DESTEK"}
      />
      <Section>
        <SectionHeading
          kicker={"TENGRİ AI"}
          title={"Birden fazla sistem. Ortak bir karar resmi."}
          lead={
            "Tengri AI; hava savunma ağları, insansız sistemler, roket teknolojileri ve haberleşme altyapılarının birlikte ele alındığı çok katmanlı bir yapay zekâ ve karar destek vizyonudur."
          }
        />
        <div className={"split-feature"}>
          <div
            className={"visual"}
            style={{ backgroundImage: "url('/assets/tengri-network.svg')" }}
          ></div>
          <div className={"copy"}>
            <span className={"eyebrow no-rule"}>
              {"AĞ MERKEZLİ YAPAY ZEKÂ"}
            </span>
            <h2>{"Veriyi anlamlandıran, sistemleri buluşturan yaklaşım."}</h2>
            <p>
              {
                "Tengri AI’ın odağında sensör ve platform verilerinden durumsal farkındalık oluşturulması, tehditlerin değerlendirilmesi ve karar süreçlerinin desteklenmesi yer alır. Amaç, birbirinden ayrı sistemleri daha bütünlüklü bir bilgi ve koordinasyon yapısı içinde değerlendirmektir."
              }
            </p>
            <p>
              {
                "Tasarımın temelinde çoklu kaynak verisi, tahmine dayalı analiz ve bağlantılı sistem mimarileri bulunur."
              }
            </p>
          </div>
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <SectionHeading
          kicker={"TANITIMDAKİ TEKNOLOJİ BAŞLIKLARI"}
          title={"Algılama. Değerlendirme. Koordinasyon."}
          lead={
            "Tengri AI yaklaşımının temelini oluşturan teknoloji başlıkları."
          }
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
          kicker={"ENTEGRE SİSTEM YAKLAŞIMI"}
          title={"Bağlantılı bir teknoloji ekosistemi."}
          lead={
            "Tengri AI’ın kamuya açık vizyonunda farklı sistem ailelerinin ortak bir yapıda değerlendirilmesi hedefleniyor."
          }
        />
        <div className={"focus-modules"}>
          <FocusModule
            number={"01 / 03"}
            title={"İnsansız Hava Platformları"}
            description={
              "Hava araçları ve uçuş sistemlerinin sağladığı verilerin daha geniş bir durum değerlendirmesine dahil edilmesi yaklaşımı."
            }
          />
          <FocusModule
            number={"02 / 03"}
            title={"Savunma Alt Sistemleri"}
            description={
              "Hava savunma ve roket sistemleri gibi farklı bileşenler arasında ortak bilgi ve koordinasyon gereksinimi."
            }
          />
          <FocusModule
            number={"03 / 03"}
            title={"Haberleşme Altyapısı"}
            description={
              "Bağlantılı birimler arasında bilgi aktarımı, veri bütünlüğü ve sistemler arası iletişim kavramları."
            }
          />
        </div>
      </Section>
      <Section className={"inner-panel"}>
        <FeatureRow
          title={"Kritik alanlar için durumsal farkındalık."}
          kicker={"VİZYON & KARAR DESTEK"}
          description={
            "Kritik altyapılar, stratejik bölgeler ve olası tehdit senaryoları için durumsal farkındalık, önceliklendirme ve öngörüye dayalı değerlendirme bu teknoloji vizyonunun kullanım alanları arasında yer alır. Bunlar mevcut operasyonel yetenek olarak değil, hedeflenen çalışma alanları olarak ele alınmaktadır."
          }
          image={"research-lab.svg"}
          reverse={false}
          href={""}
          label={""}
        />
      </Section>
      <Section>
        <SectionHeading
          kicker={"İLİŞKİLİ TEKNOLOJİLER"}
          title={"Tengri AI ve sistem mühendisliği."}
          lead={
            "Gömülü yazılım, sensör füzyonu, otonomi ve haberleşme; ağ bağlantılı yapay zekâ yaklaşımlarını tamamlayan mühendislik alanlarıdır."
          }
        />
      </Section>
    </>
  );
}
