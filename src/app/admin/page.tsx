import Link from "next/link";
import { requireAdmin } from "@/lib/cms/server";

const names: Record<string, string> = {
  page: "Web sayfası",
  news: "Haber ve duyuru",
  project: "Proje ve AR-GE",
  platform: "Platform",
  technology: "Teknoloji",
  capability: "Kabiliyet",
};
const stateNames: Record<string, string> = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşiv",
};
function numberLabel(count: number | null) {
  return count === null ? "—" : count.toLocaleString("tr-TR");
}

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { db } = await requireAdmin();
  const params = await searchParams;
  const page = Math.max(0, Math.min(1000, Number(params.page) || 0));
  const search = (params.q || "").trim().slice(0, 100);
  let query = db
    .from("cms_documents")
    .select("id,kind,slug,body,approval,status,revision,updated_at")
    .order("updated_at", { ascending: false })
    .range(page * 20, page * 20 + 19);
  if (search) {
    query = query.ilike("body->>title", "%" + search.replace(/[%_]/g, "") + "%");
  }

  const [listing, total, drafts, published, reviewing] = await Promise.all([
    query,
    db.from("cms_documents").select("id", { count: "exact", head: true }),
    db.from("cms_documents").select("id", { count: "exact", head: true }).eq("status", "draft"),
    db.from("cms_documents").select("id", { count: "exact", head: true }).eq("status", "published"),
    db.from("cms_documents").select("id", { count: "exact", head: true }).eq("approval", "in_review"),
  ]);
  const { data, error } = listing;
  const cards = [
    { label: "Toplam içerik", count: total.count, description: "Sistemdeki tüm kayıtlar", marker: "▦" },
    { label: "Taslaklar", count: drafts.count, description: "Düzenlemeye açık", marker: "✎" },
    { label: "İncelemede", count: reviewing.count, description: "Değerlendirme bekleyen", marker: "◷" },
    { label: "Yayımlanan", count: published.count, description: "Onaylanmış kayıtlar", marker: "✓" },
  ];

  return (
    <section className="cms-dashboard">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">GENEL BAKIŞ / İÇERİK STÜDYOSU</div>
          <h1>İçeriklerin kontrolü sizde.</h1>
          <p>Kurumsal sayfalarınızı yönetin, içerik hazırlayın ve yayın süreçlerini tek yerden takip edin.</p>
        </div>
        <Link className="cms-action-primary" href="/admin/new/news">＋ Yeni içerik</Link>
      </div>

      <div className="cms-stat-grid" aria-label="İçerik istatistikleri">
        {cards.map((card) => (
          <article className="cms-stat-card" key={card.label}>
            <div className="cms-stat-top">
              <span>{card.label}</span>
              <span className="cms-stat-symbol" aria-hidden="true">{card.marker}</span>
            </div>
            <strong>{numberLabel(card.count)}</strong>
            <small>{card.description}</small>
          </article>
        ))}
      </div>

      <div className="cms-quick-grid">
        <Link href="/admin/pages" className="cms-quick-card">
          <span className="cms-quick-symbol" aria-hidden="true">▤</span>
          <span><strong>Web sayfalarını düzenle</strong><small>Mevcut kurumsal sayfa ve metin alanları</small></span>
          <span className="cms-quick-arrow" aria-hidden="true">↗</span>
        </Link>
        <Link href="/admin/library" className="cms-quick-card">
          <span className="cms-quick-symbol" aria-hidden="true">▦</span>
          <span><strong>Haberler, projeler ve teknolojiler</strong><small>Ortak içerikleri tek yerden düzenle</small></span>
          <span className="cms-quick-arrow" aria-hidden="true">↗</span>
        </Link>
        <Link href="/admin/media" className="cms-quick-card">
          <span className="cms-quick-symbol" aria-hidden="true">▧</span>
          <span><strong>Medya kütüphanesi</strong><small>Görselleri ve kullanım izinlerini yönet</small></span>
          <span className="cms-quick-arrow" aria-hidden="true">↗</span>
        </Link>
      </div>

      <div className="cms-content-panel">
        <div className="cms-section-heading">
          <div>
            <div className="cms-eyebrow">İÇERİK KÜTÜPHANESİ</div>
            <h2>İçerik listesi</h2>
          </div>
          <span className="cms-section-meta">Sayfa {page + 1}</span>
        </div>
        <form className="cms-search-form" action="/admin" method="get">
          <label htmlFor="cms-search">İçeriklerde ara</label>
          <div className="cms-search-controls">
            <input id="cms-search" name="q" type="search" placeholder="Başlığa göre ara..." defaultValue={search} maxLength={100} />
            <button type="submit">Ara</button>
            {search && <Link href="/admin" className="cms-text-action">Temizle</Link>}
          </div>
        </form>
        <p className="cms-inline-notice">
          Test ortamı: yayınlanan içerikler, genel siteye yalnızca son kabul testlerinden sonra aktarılır.
        </p>
        {error ? (
          <p role="alert" className="cms-form-error">İçerikler yüklenemedi. Bağlantı veya yetkileri kontrol edin.</p>
        ) : !data?.length ? (
          <div className="cms-empty-state">
            <span aria-hidden="true">◌</span>
            <h3>{search ? "Aramanızla eşleşen içerik yok." : "Henüz içerik bulunmuyor."}</h3>
            <p>Başka bir başlık deneyebilir veya yeni bir içerik hazırlayabilirsiniz.</p>
            <Link href="/admin/new/news">Yeni haber oluştur →</Link>
          </div>
        ) : (
          <div className="cms-table-scroll">
            <table className="cms-data-table">
              <thead>
                <tr>
                  <th scope="col">İçerik</th>
                  <th scope="col">Tür</th>
                  <th scope="col">Durum</th>
                  <th scope="col">Güncelleme</th>
                  <th scope="col"><span className="cms-visually-hidden">İşlem</span></th>
                </tr>
              </thead>
              <tbody>
                {data.map((doc) => {
                  const url = doc.kind === "page" ? "/admin/pages/" + doc.slug : "/admin/content/" + doc.id;
                  return (
                    <tr key={doc.id}>
                      <td className="cms-content-name">
                        <Link href={url}>{doc.body?.title || "Başlıksız içerik"}</Link>
                        <small>{doc.slug}</small>
                      </td>
                      <td>{names[doc.kind] || doc.kind}</td>
                      <td><span className={"cms-status-badge cms-status-" + doc.status}>{stateNames[doc.status] || doc.status}</span></td>
                      <td><time dateTime={doc.updated_at}>{new Date(doc.updated_at).toLocaleDateString("tr-TR")}</time></td>
                      <td><Link href={url} className="cms-row-action">Düzenle ↗</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <nav aria-label="İçerik sayfaları" className="cms-pagination">
          {page > 0 && <Link href={"/admin?page=" + (page - 1) + "&q=" + encodeURIComponent(search)}>← Önceki sayfa</Link>}
          {data?.length === 20 && <Link href={"/admin?page=" + (page + 1) + "&q=" + encodeURIComponent(search)}>Sonraki sayfa →</Link>}
        </nav>
      </div>
    </section>
  );
}
