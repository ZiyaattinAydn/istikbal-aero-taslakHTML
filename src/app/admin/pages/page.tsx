import { requireAdmin } from "@/lib/cms/server";
import snapshots from "../../../../docs/cms/page-snapshots.json";
import { routes } from "@/data/routes";
export default async function Pages() {
  await requireAdmin();
  return (
    <section>
      <h1>Mevcut sayfalar</h1>
      <p>
        21 sayfanın içerik envanteri hazır. Bölüm düzenleyicisi ve veritabanı
        aktarımı, hosting doğrulaması tamamlandığında bağlanacak.
      </p>
      <ul>
        {routes.map((r) => (
          <li key={r.slug}>
            <a href={`/${r.slug}`} target="_blank" rel="noreferrer">
              {r.title.split("|")[0]}
            </a>
            <p>{r.description}</p>
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
