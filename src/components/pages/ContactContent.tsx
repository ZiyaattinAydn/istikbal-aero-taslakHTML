import { pageValue, type PageValues } from "@/lib/cms/page-values";
import { Section, SectionHeading, InnerHero } from "@/components/ui/content";
import { ContactForm } from "@/components/ui/ContactForm";

export function ContactContent({ content = {} }: { content?: PageValues }) {
  return (
    <>
      <InnerHero
        title={pageValue(
          content,
          "ContactContent.title.0",
          "İletişim",
          "text",
          "Başlık",
        )}
        description={pageValue(
          content,
          "ContactContent.description.1",
          "İstikbal Aerospace ile iletişime geçin.",
          "text",
          "Açıklama",
        )}
        image={pageValue(
          content,
          "ContactContent.image.2",
          "platform-systems.svg",
          "image",
          "Görsel",
        )}
        breadcrumb={pageValue(
          content,
          "ContactContent.breadcrumb.3",
          "İLETIŞIM",
          "text",
          "Gezinme metni",
        )}
        kicker={pageValue(
          content,
          "ContactContent.kicker.4",
          "İSTİKBAL AEROSPACE",
          "text",
          "Bölüm etiketi",
        )}
      />
      <Section>
        <SectionHeading
          kicker={pageValue(
            content,
            "ContactContent.kicker.5",
            "İLETİŞİM",
            "text",
            "Bölüm etiketi",
          )}
          title={pageValue(
            content,
            "ContactContent.title.6",
            "Birlikte iletişime geçelim.",
            "text",
            "Başlık",
          )}
          lead={pageValue(
            content,
            "ContactContent.lead.7",
            "Genel sorular, kurumsal iş birlikleri ve teknoloji alanları hakkında bilgi için.",
            "text",
            "Açıklama",
          )}
        />
        <div className={"contact-grid"}>
          <div className={"contact-infos"}>
            <div className={"contact-line"}>
              <span>
                {pageValue(
                  content,
                  "ContactContent.text.8",
                  "ŞİRKET",
                  "text",
                  "Metin",
                )}
              </span>
              <strong>
                {pageValue(
                  content,
                  "ContactContent.text.9",
                  "İstikbal Aerospace",
                  "text",
                  "Metin",
                )}
              </strong>
            </div>
            <div className={"contact-line"}>
              <span>
                {pageValue(
                  content,
                  "ContactContent.text.10",
                  "E-POSTA",
                  "text",
                  "Metin",
                )}
              </span>
              <strong>
                <a
                  href={pageValue(
                    content,
                    "ContactContent.href.11",
                    "mailto:abdullahdemiral@istikbalaerospace.com",
                    "link",
                    "Bağlantı",
                  )}
                >
                  {pageValue(
                    content,
                    "ContactContent.text.12",
                    "abdullahdemiral@istikbalaerospace.com",
                    "text",
                    "Metin",
                  )}
                </a>
              </strong>
            </div>
            <div className={"contact-line"}>
              <span>
                {pageValue(
                  content,
                  "ContactContent.text.13",
                  "TELEFON",
                  "text",
                  "Metin",
                )}
              </span>
              <strong>
                <a
                  href={pageValue(
                    content,
                    "ContactContent.href.14",
                    "tel:+905462781931",
                    "link",
                    "Bağlantı",
                  )}
                >
                  {pageValue(
                    content,
                    "ContactContent.text.15",
                    "+90 546 278 19 31",
                    "text",
                    "Metin",
                  )}
                </a>
              </strong>
            </div>
            <div className={"contact-line"}>
              <span>
                {pageValue(
                  content,
                  "ContactContent.text.16",
                  "KONUM",
                  "text",
                  "Metin",
                )}
              </span>
              <strong>
                {pageValue(
                  content,
                  "ContactContent.text.17",
                  "Kepez, Antalya / Türkiye",
                  "text",
                  "Metin",
                )}
              </strong>
            </div>
            <p className={"small muted"} style={{ marginTop: "29px" }}>
              {pageValue(
                content,
                "ContactContent.text.18",
                "İletişim formu henüz sunucuya bağlı değildir. Doğrudan e-posta veya telefon yoluyla ulaşabilirsiniz.",
                "text",
                "Metin",
              )}
            </p>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
