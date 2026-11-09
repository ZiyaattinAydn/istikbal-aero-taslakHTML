import type { PublicNews } from "@/data/models";
import { InnerHero, Section } from "@/components/ui/content";
import { SiteLink } from "@/components/ui/SiteLink";
import { safeMediaName, safeExternalSource } from "@/lib/urls";
export function NewsDetailContent({ item }: { item: PublicNews | undefined }) {
  if (!item)
    return (
      <>
        <InnerHero
          title="İçerik bulunamadı"
          description="Aradığınız yayın mevcut değil."
          image="research-lab.svg"
          breadcrumb="HABERLER / İÇERİK BULUNAMADI"
        />
        <Section>
          <article className="article">
            <h2>Yayın bulunamadı.</h2>
            <p>Bağlantı hatalı veya içerik kaldırılmış olabilir.</p>
            <p>
              <SiteLink href="haberler.html" className="text-link">
                Haberler ve Duyurular ↗
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
              src={`/assets/${safeMediaName(item.image)}`}
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
                Orijinal LinkedIn paylaşımı ↗
              </a>
            </p>
          )}
        </article>
      </Section>
    </>
  );
}
