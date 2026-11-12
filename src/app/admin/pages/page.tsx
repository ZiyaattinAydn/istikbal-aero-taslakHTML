import Link from "next/link";
import { requireAdmin } from "@/lib/cms/server";
import snapshots from "../../../../docs/cms/page-snapshots.json";
import { routes } from "@/data/routes";

export default async function Pages() {
  await requireAdmin();
  return (
    <section className="cms-page-browser">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">İÇERİK KÜTÜPHANESİ / WEB SAYFALARI</div>
          <h1>Kurumsal sayfalar</h1>
          <p>Site tasarımı ve animasyonlar korunur. Buradan metinleri, görselleri ve SEO alanlarını düzenleyebilirsiniz.</p>
        </div>
        <span className="cms-page-count">{routes.length} sayfa</span>
      </div>
      <div className="cms-pages-grid">
        {routes.map((route, index) => {
          const preview = route.slug === "index" ? "/" : "/" + route.slug;
          const page = snapshots.find((item) => item.route === route.slug);
          return (
            <article className="cms-page-card" key={route.slug}>
              <div className="cms-page-card-top">
                <span>WEB SAYFASI · {String(index + 1).padStart(2, "0")}</span>
                <span className="cms-page-card-symbol" aria-hidden="true">▤</span>
              </div>
              <h2>{route.title.split("|")[0]}</h2>
              <p>{route.description}</p>
              <div className="cms-page-card-actions">
                <Link href={"/admin/pages/" + route.slug} className="cms-page-edit">Düzenle ↗</Link>
                <a href={preview} target="_blank" rel="noreferrer">Sayfayı aç ↗</a>
              </div>
              {page?.sections?.length ? (
                <details className="cms-page-card-details">
                  <summary>Mevcut içerikleri görüntüle</summary>
                  <div className="cms-page-card-texts">
                    {page.sections.map((section, i) => <p key={i}>{section.text}</p>)}
                  </div>
                </details>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
