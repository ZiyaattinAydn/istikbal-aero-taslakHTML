import { requireAdmin } from "@/lib/cms/server";
import { legacyRecords, isExistingContent } from "@/lib/cms/legacy-content";
import { ContentLibrary, type LibraryItem } from "@/components/admin/ContentLibrary";

export default async function Library() {
  const { db } = await requireAdmin();
  // Always look up all 13 canonical entries, including old records
  // that may no longer be among the 250 most recently edited documents.
  const [latest, imported] = await Promise.all([
    db.from("cms_documents")
      .select("id,kind,slug,status,body")
      .in("kind", ["news", "project", "platform", "technology", "capability"])
      .order("updated_at", { ascending: false })
      .limit(250),
    db.from("cms_documents")
      .select("id,kind,slug,status,body")
      .in("kind", ["news", "project", "platform", "technology"])
      .in("slug", legacyRecords.map((item) => item.slug))
      .limit(50),
  ]);

  if (latest.error || imported.error) {
    return (
      <section className="cms-editor-page">
        <h1>İçerik kütüphanesi</h1>
        <p role="alert">İçerikler yüklenemedi. Veritabanı bağlantısını kontrol edin.</p>
      </section>
    );
  }

  const docs = [...(imported.data || []), ...(latest.data || [])];
  const existing = [...new Map(docs.map((item) => [item.id, item])).values()];
  const { data: activePublications, error: publicationError } = existing.length
    ? await db.from("cms_published").select("document_id")
        .in("document_id", existing.map((item) => item.id))
    : { data: [], error: null };
  if (publicationError) throw Error("İçeriklerin yayın durumları yüklenemedi.");
  const publishedIds = new Set((activePublications || []).map((item) => item.document_id));
  const canonical: LibraryItem[] = legacyRecords.map((record) => {
    const saved = existing.find((item) =>
      item.kind === record.kind && item.slug === record.slug,
    );
    return {
      kind: record.kind,
      slug: record.slug,
      title: saved?.body?.title || record.body.title,
      summary: saved?.body?.summary || record.body.summary,
      id: saved?.id,
      status: saved?.status,
      published: Boolean(saved?.id && publishedIds.has(saved.id)),
      canonical: true,
    };
  });
  const newContent: LibraryItem[] = existing
    .filter((item) => !isExistingContent(item.kind, item.slug))
    .map((item) => ({
      kind: item.kind,
      slug: item.slug,
      title: item.body?.title || "Başlıksız içerik",
      summary: item.body?.summary || "",
      id: item.id,
      status: item.status,
      published: publishedIds.has(item.id),
      canonical: false,
    }));
  return (
    <section className="cms-page-browser">
      <ContentLibrary items={[...canonical, ...newContent]} truncated={(latest.data?.length || 0) === 250} />
    </section>
  );
}
