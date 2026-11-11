import { publishedEntries } from "@/lib/cms/public";
import { Section, SectionHeading } from "@/components/ui/content";
import { SiteLink } from "@/components/ui/SiteLink";
const kinds: Record<string, string> = {
  news: "news",
  projects: "project",
  platforms: "platform",
  tech: "technology",
  capabilities: "capability",
};
export async function PublishedCards({ page }: { page: string }) {
  const kind = kinds[page];
  if (!kind) return null;
  const entries = await publishedEntries(kind);
  if (!entries.length) return null;
  return (
    <Section>
      <SectionHeading
        kicker="GÜNCEL İÇERİKLER"
        title="Şirketten güncel bilgiler."
      />
      <div className="cards-3">
        {entries.map((item) => (
          <article className="news-card" key={item.document_id}>
            <div className="news-content">
              <h3>{item.body.title}</h3>
              <p>{item.body.summary}</p>
              <SiteLink href={`/icerik/${kind}/${item.slug}`}>
                İncele ↗
              </SiteLink>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
