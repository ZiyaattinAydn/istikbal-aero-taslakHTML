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
}: {
  body: ContentBody;
  kind: string;
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
    </SiteShell>
  );
}
