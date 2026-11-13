import { requireAdmin } from "@/lib/cms/server";
import { routes } from "@/data/routes";
import { PageBrowser } from "@/components/admin/PageBrowser";

export default async function Pages() {
  await requireAdmin();
  return (
    <section className="cms-page-browser">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">İÇERİK KÜTÜPHANESİ / WEB SAYFALARI</div>
          <h1>Kurumsal sayfalar</h1>
          <p>Sayfaları ana sitedeki menüye göre filtreleyin. Mevcut düzen, animasyonlar ve bağlantılar korunur.</p>
        </div>
        <span className="cms-page-count">{routes.length} sayfa</span>
      </div>
      <PageBrowser />
    </section>
  );
}
