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
  return <EntryContent body={data.body} kind={data.kind} />;
}
