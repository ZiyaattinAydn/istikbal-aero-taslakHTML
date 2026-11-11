import Link from "next/link";
import { requireAdmin } from "@/lib/cms/server";
import { logout } from "./login/actions";
const names: Record<string, string> = {
  news: "Haberler ve duyurular",
  project: "Projeler ve AR-GE",
  platform: "Platformlar",
  technology: "Teknolojiler",
  capability: "Kabiliyetler",
};
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { db } = await requireAdmin();
  const params = await searchParams;
  const page = Math.max(0, Math.min(1000, Number(params.page) || 0));
  let query = db
    .from("cms_documents")
    .select("id,kind,slug,body,approval,status,revision,updated_at")
    .order("updated_at", { ascending: false })
    .range(page * 20, page * 20 + 19);
  if (params.q)
    query = query.ilike(
      "body->>title",
      `%${params.q.slice(0, 100).replace(/[%_]/g, "")}%`,
    );
  const { data, error } = await query;
  return (
    <section>
      <h1>İçerikler</h1>
      <nav>
        <Link href="/admin/media">Medya kütüphanesi</Link>
        <Link href="/admin/pages">Mevcut sayfalar</Link>
        {Object.entries(names).map(([kind, title]) => (
          <Link key={kind} href={`/admin/new/${kind}`}>
            {title} ekle
          </Link>
        ))}
      </nav>
      <p>
        Bu kurulum geliştirme aşamasında. Public içerik okuması yalnız kurulum
        kabulünden sonra açılır.
      </p>
      <form>
        <label>
          İçerik ara
          <input name="q" defaultValue={params.q} maxLength={100} />
        </label>
        <button>Ara</button>
      </form>
      {error ? (
        <p role="alert">
          İçerikler yüklenemedi. Kurulumun tamamlandığını kontrol edin.
        </p>
      ) : (
        <ul>
          {data?.map((d) => (
            <li key={d.id}>
              <Link
                href={
                  d.kind === "page"
                    ? `/admin/pages/${d.slug}`
                    : `/admin/content/${d.id}`
                }
              >
                {d.body.title}
              </Link>
              <small>{names[d.kind] || "Sayfa"}</small>
            </li>
          ))}
        </ul>
      )}
      <nav>
        {page > 0 && (
          <Link
            href={`/admin?page=${page - 1}&q=${encodeURIComponent(params.q || "")}`}
          >
            Önceki
          </Link>
        )}
        {data?.length === 20 && (
          <Link
            href={`/admin?page=${page + 1}&q=${encodeURIComponent(params.q || "")}`}
          >
            Sonraki
          </Link>
        )}
      </nav>
      <form action={logout}>
        <button>Oturumu kapat</button>
      </form>
    </section>
  );
}
