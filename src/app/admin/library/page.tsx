import { requireAdmin } from "@/lib/cms/server";
import { legacyRecords, isExistingContent } from "@/lib/cms/legacy-content";
import { ContentLibrary, type LibraryItem } from "@/components/admin/ContentLibrary";

export default async function Library() {
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from("cms_documents")
    .select("id,kind,slug,status,body")
    .in("kind", ["news", "project", "platform", "technology", "capability"])
    .order("updated_at", { ascending: false })
    .limit(250);

  if (error) {
    return (
      <section className="cms-editor-page">
        <h1>İçerik kütüphanesi</h1>
        <p role="alert">İçerikler yüklenemedi. Veritabanı bağlantısını kontrol edin.</p>
      </section>
    );
  }

  const existing = data || [];
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
      canonical: false,
    }));
  return (
    <section className="cms-page-browser">
      <ContentLibrary items={[...canonical, ...newContent]} truncated={existing.length === 250} />
    </section>
  );
}
