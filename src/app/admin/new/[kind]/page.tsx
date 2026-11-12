import { editorOptions } from "@/lib/cms/editor-options";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { kinds, type Kind } from "@/lib/cms/model";
import { ContentEditor } from "@/components/admin/ContentEditor";
export default async function New({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { db } = await requireAdmin();
  const { kind } = await params;
  if (!kinds.includes(kind as Kind) || kind === "page") notFound();
  const options = await editorOptions(db);
  return (
    <section className="cms-editor-page">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">İÇERİK KÜTÜPHANESİ / YENİ KAYIT</div>
          <h1>Yeni içerik</h1>
          <p>İçeriğinizi oluşturun ve taslak olarak kaydedin. Yayınlama ayrı bir onay adımıdır.</p>
        </div>
        <a href="/admin" className="cms-editor-back">← İçeriklere dön</a>
      </div>
      <ContentEditor
        {...options}
        kind={kind}
        creationId={crypto.randomUUID()}
      />
    </section>
  );
}
