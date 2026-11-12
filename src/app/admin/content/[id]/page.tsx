import Link from "next/link";
import { editorOptions } from "@/lib/cms/editor-options";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { ContentEditor } from "@/components/admin/ContentEditor";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { db, role } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data, error } = await db
    .from("cms_documents")
    .select("id,kind,body,revision,approval,status")
    .eq("id", id)
    .maybeSingle();
  if (error || !data || data.kind === "page") notFound();
  const { data: publication, error: publicationError } = await db
    .from("cms_published")
    .select("document_id")
    .eq("document_id", id)
    .maybeSingle();
  if (publicationError) throw Error("Yayın durumu yüklenemedi.");
  const { data: versions } = await db
    .from("cms_versions")
    .select("revision,created_at")
    .eq("document_id", id)
    .order("revision", { ascending: false })
    .limit(30);
  const options = await editorOptions(db, id);
  return (
    <section className="cms-editor-page">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">İÇERİK KÜTÜPHANESİ / DÜZENLE</div>
          <h1>{data.body.title || "İçeriği düzenle"}</h1>
          <p>Revizyon {data.revision} · Taslağı kaydedin, ardından doğrudan yayımlayın.</p>
        </div>
        <Link href="/admin/library" className="cms-editor-back">← İçeriklere dön</Link>
      </div>
      <ContentEditor
        {...options}
        key={`${id}:${data.revision}`}
        document={data}
        kind={data.kind}
        publisher={role === "publisher"}
        published={Boolean(publication)}
        versions={versions || []}
      />
    </section>
  );
}
