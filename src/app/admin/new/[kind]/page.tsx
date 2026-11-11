import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { kinds, type Kind } from "@/lib/cms/model";
import { ContentEditor } from "@/components/admin/ContentEditor";
export default async function New({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  await requireAdmin();
  const { kind } = await params;
  if (!kinds.includes(kind as Kind) || kind === "page") notFound();
  return (
    <section>
      <h1>Yeni içerik</h1>
      <ContentEditor kind={kind} />
    </section>
  );
}
