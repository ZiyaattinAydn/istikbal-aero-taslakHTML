import { publishedEntries, publishedAssets } from "@/lib/cms/public";
import { isExistingContent } from "@/lib/cms/legacy-content";
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
  const entries = (await publishedEntries(kind)).filter(
    (entry) => !isExistingContent(entry.kind, entry.slug),
  );
  if (!entries.length) return null;
  const assets = await publishedAssets(
    entries.flatMap((e) => (e.body.cover_id ? [e.body.cover_id] : [])),
  );
  return (
    <Section>
      <SectionHeading
        kicker="GÜNCEL İÇERİKLER"
        title="Şirketten güncel bilgiler."
      />
      <div className="cards-3">
        {entries.map((item) => (
          <article className="news-card" key={item.document_id}>
            {assets
              .filter((a) => a.id === item.body.cover_id)
              .map((a) => (
                <img
                  key={a.id}
                  className="entry-cover"
                  src={`/cms-media/${a.id}`}
                  alt={a.alt}
                  width={a.width}
                  height={a.height}
                  loading="lazy"
                />
              ))}
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
