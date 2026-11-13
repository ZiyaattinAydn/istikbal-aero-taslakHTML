import { pageValue, type PageValues } from "@/lib/cms/page-values";
import type { PublicNews } from "@/data/models";
import { InnerHero, Section } from "@/components/ui/content";
import { SiteLink } from "@/components/ui/SiteLink";
import { safeMediaName, safeExternalSource, mediaUrl } from "@/lib/urls";
export function NewsDetailContent({
  item,
  content = {},
}: {
  item: PublicNews | undefined;
  content?: PageValues;
}) {
  if (!item)
    return (
      <>
        <InnerHero
          title={pageValue(
            content,
            "NewsDetailContent.title.0",
            "İçerik bulunamadı",
            "text",
            "Başlık",
          )}
          description={pageValue(
            content,
            "NewsDetailContent.description.1",
            "Aradığınız yayın mevcut değil.",
            "text",
            "Açıklama",
          )}
          image={pageValue(
            content,
            "NewsDetailContent.image.2",
            "research-lab.svg",
            "image",
            "Görsel",
          )}
          breadcrumb={pageValue(
            content,
            "NewsDetailContent.breadcrumb.3",
            "HABERLER / İÇERİK BULUNAMADI",
            "text",
            "Gezinme metni",
          )}
        />
        <Section>
          <article className="article">
            <h2>
              {pageValue(
                content,
                "NewsDetailContent.text.4",
                "Yayın bulunamadı.",
              )}
            </h2>
            <p>
              {pageValue(
                content,
                "NewsDetailContent.text.5",
                "Bağlantı hatalı veya içerik kaldırılmış olabilir.",
              )}
            </p>
            <p>
              <SiteLink
                href={pageValue(
                  content,
                  "NewsDetailContent.href.6",
                  "haberler.html",
                  "link",
                  "Bağlantı",
                )}
                className="text-link"
              >
                {pageValue(
                  content,
                  "NewsDetailContent.text.7",
                  "Haberler ve Duyurular ↗",
                )}
              </SiteLink>
            </p>
          </article>
        </Section>
      </>
    );
  const a = item.article,
    source = safeExternalSource(item.sourceUrl);
  return (
    <>
      <InnerHero
        title={a.heroTitle || item.title}
        description={a.heroDescription || item.summary}
        image={safeMediaName(item.image)}
        breadcrumb={a.breadcrumb || "HABERLER"}
      />
      <Section>
        <article className="article">
          <span className="eyebrow no-rule">{a.eyebrow || item.category}</span>
          <h2>{a.heading || item.title}</h2>
          <p>{a.intro || item.summary}</p>
          <div className="article-img">
            <img
              src={mediaUrl(item.image)}
              alt={`Temsili görsel: ${a.heroTitle || item.title}`}
              loading="lazy"
              decoding="async"
              width="1200"
              height="675"
            />
          </div>
          <h2>{a.sectionHeading || "Teknoloji paylaşımı"}</h2>
          <p>{a.sectionBody || item.summary}</p>
          {a.note && <p>{a.note}</p>}
          {source && (
            <p>
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                {pageValue(
                  content,
                  "NewsDetailContent.text.8",
                  "Orijinal LinkedIn paylaşımı ↗",
                )}
              </a>
            </p>
          )}
        </article>
      </Section>
    </>
  );
}
