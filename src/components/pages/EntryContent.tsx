import { SiteLink } from "@/components/ui/SiteLink";
import type { EntryLink, CoverAsset } from "@/lib/cms/public";
import { SiteShell } from "@/components/layout/SiteShell";
import { InnerHero, Section } from "@/components/ui/content";
import type { ContentBody } from "@/lib/cms/model";
import type { PageId } from "@/data/routes";
const pages: Record<string, PageId> = {
  news: "newsDetail",
  project: "projectDetail",
  platform: "platformDetail",
  technology: "tech",
  capability: "capabilities",
};
export function EntryContent({
  body,
  kind,
  cover,
  related = [],
  preview = false,
}: {
  body: ContentBody;
  kind: string;
  cover?: CoverAsset;
  related?: EntryLink[];
  preview?: boolean;
}) {
  return (
    <SiteShell page={pages[kind] || "newsDetail"}>
      <InnerHero
        title={body.title}
        description={body.summary}
        image="research-lab.svg"
      />
      <Section>
        <article className="article">
          {cover && (
            <img
              src={`${preview ? "/admin/media" : "/cms-media"}/${cover.id}${preview ? "/file" : ""}`}
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              className="entry-cover"
            />
          )}
          {body.stage && <p>Çalışmanın aşaması: {body.stage}</p>}
          {body.date && <time dateTime={body.date}>{body.date}</time>}
          {body.paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
          {body.source && (
            <a href={body.source} target="_blank" rel="noreferrer">
              Kaynak
            </a>
          )}
        </article>
      </Section>
      {related.length > 0 && (
        <Section>
          <h2 className="section-title">İlişkili içerikler</h2>
          <div className="cards-3">
            {related.map((item) => (
              <article className="news-card" key={item.document_id}>
                <div className="news-content">
                  <h3>{item.body.title}</h3>
                  <p>{item.body.summary}</p>
                  <SiteLink
                    href={
                      preview
                        ? `/admin/content/${item.document_id}/preview`
                        : `/icerik/${item.kind}/${item.slug}`
                    }
                  >
                    İncele ↗
                  </SiteLink>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}
    </SiteShell>
  );
}
