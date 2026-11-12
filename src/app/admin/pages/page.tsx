import Link from "next/link";
import { requireAdmin } from "@/lib/cms/server";
import snapshots from "../../../../docs/cms/page-snapshots.json";
import { routes } from "@/data/routes";
export default async function Pages() {
  await requireAdmin();
  return (
    <section>
      <h1>Mevcut sayfalar</h1>
      <p>
        Sayfayı seçip mevcut alanları düzenleyin, taslak kaydedin ve gerçek
        şablonda önizleyin.
      </p>
      <ul>
        {routes.map((r) => (
          <li key={r.slug}>
            <a href={`/${r.slug}`} target="_blank" rel="noreferrer">
              {r.title.split("|")[0]}
            </a>
            <p>{r.description}</p>
            <Link href={`/admin/pages/${r.slug}`}>Sayfayı düzenle</Link>
            <details>
              <summary>Mevcut metinleri gör</summary>
              {snapshots
                .find((p) => p.route === r.slug)
                ?.sections.map((section, index) => (
                  <p key={index}>{section.text}</p>
                ))}
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
