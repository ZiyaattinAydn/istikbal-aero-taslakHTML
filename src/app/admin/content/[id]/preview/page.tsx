import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { EntryContent } from "@/components/pages/EntryContent";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { db } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data, error } = await db
    .from("cms_documents")
    .select("kind,body")
    .eq("id", id)
    .maybeSingle();
  if (error || !data || data.kind === "page") notFound();
  const [related, cover] = await Promise.all([
    data.body.related_ids?.length
      ? db
          .from("cms_documents")
          .select("id,kind,slug,body")
          .in("id", data.body.related_ids)
          .limit(12)
      : Promise.resolve({ data: [] }),
    data.body.cover_id
      ? db
          .from("cms_media")
          .select("id,alt,width,height")
          .eq("id", data.body.cover_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return (
    <EntryContent
      preview
      body={data.body}
      kind={data.kind}
      cover={cover.data || undefined}
      related={(related.data || []).map((x) => ({ document_id: x.id, ...x }))}
    />
  );
}
