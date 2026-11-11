import { notFound } from "next/navigation";
import { publishedEntry } from "@/lib/cms/public";
import { SiteShell } from "@/components/layout/SiteShell";
import { InnerHero, Section } from "@/components/ui/content";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const { kind, slug } = await params;
  if (
    !["news", "project", "platform", "technology", "capability"].includes(
      kind,
    ) ||
    !/^[a-z0-9-]{1,80}$/.test(slug)
  )
    return {};
  const entry = await publishedEntry(kind, slug);
  return entry
    ? { title: entry.body.title, description: entry.body.summary }
    : {};
}
export default async function Detail({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const { kind, slug } = await params;
  if (
    !["news", "project", "platform", "technology", "capability"].includes(
      kind,
    ) ||
    !/^[a-z0-9-]{1,80}$/.test(slug)
  )
    notFound();
  const item = await publishedEntry(kind, slug);
  if (!item) notFound();
  return (
    <SiteShell page="newsDetail">
      <InnerHero
        title={item.body.title}
        description={item.body.summary}
        image="research-lab.svg"
      />
      <Section>
        <article className="article">
          {item.body.date && (
            <time dateTime={item.body.date}>{item.body.date}</time>
          )}
          {item.body.paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
          {item.body.source && (
            <a href={item.body.source} target="_blank" rel="noreferrer">
              Kaynak
            </a>
          )}
        </article>
      </Section>
    </SiteShell>
  );
}
