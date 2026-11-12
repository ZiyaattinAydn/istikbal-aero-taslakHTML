import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { pageSchema } from "@/lib/cms/pages";
import { PageEditor } from "@/components/admin/PageEditor";
export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { db, role } = await requireAdmin();
  const { slug } = await params;
  const schema = pageSchema(slug);
  if (!schema) notFound();
  const { data: doc } = await db
    .from("cms_documents")
    .select("id,kind,body,revision,approval,status")
    .eq("kind", "page")
    .eq("slug", slug)
    .maybeSingle();
  if (!doc)
    return (
      <section>
        <h1>{schema.title.split("|")[0]}</h1>
        <p>Sayfa şablonu hazır; veritabanı aktarımı tamamlanmalı.</p>
      </section>
    );
  const [{ data: versions }, { data: media }] = await Promise.all([
    db
      .from("cms_versions")
      .select("revision,created_at")
      .eq("document_id", doc.id)
      .order("revision", { ascending: false })
      .limit(30),
    db
      .from("cms_media")
      .select("id,alt,visibility")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  return (
    <section>
      <h1>{schema.title.split("|")[0]}</h1>
      <PageEditor
        key={`${slug}:${doc.revision}`}
        slug={slug}
        revision={doc.revision}
        title={doc.body.title}
        summary={doc.body.summary}
        fields={schema.fields}
        values={doc.body.fields || {}}
        media={media || []}
        record={doc}
        versions={versions || []}
        publisher={role === "publisher"}
      />
    </section>
  );
}
