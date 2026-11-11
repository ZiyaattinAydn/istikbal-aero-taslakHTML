import { notFound } from "next/navigation";
import {
  publishedEntry,
  publishedRelations,
  publishedAssets,
} from "@/lib/cms/public";
import { EntryContent } from "@/components/pages/EntryContent";
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
  const [related, assets] = await Promise.all([
    publishedRelations(item.body.related_ids || []),
    publishedAssets(item.body.cover_id ? [item.body.cover_id] : []),
  ]);
  return (
    <EntryContent
      body={item.body}
      kind={kind}
      related={related}
      cover={assets[0]}
    />
  );
}
