import { requireAdmin } from "@/lib/cms/server";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { publishMedia } from "./actions";
export default async function Media() {
  const { db, role } = await requireAdmin();
  const { data, error } = await db
    .from("cms_media")
    .select("id,alt,bytes,width,height,visibility")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <section>
      <h1>Medya kütüphanesi</h1>
      <MediaUpload />
      {error && <p role="alert">Kütüphane yüklenemedi.</p>}
      {data?.map((m) => (
        <article key={m.id}>
          <h2>{m.alt}</h2>
          <a
            href={`/admin/media/${m.id}/file`}
            target="_blank"
            rel="noreferrer"
          >
            Görseli aç
          </a>
          <p>
            {m.width} × {m.height} — {Math.ceil(m.bytes / 1024)} KB —{" "}
            {m.visibility === "public" ? "Yayın izni açık" : "Özel"}
          </p>
          {role === "publisher" && m.visibility === "private" && (
            <form action={publishMedia}>
              <input type="hidden" name="id" value={m.id} />
              <button>Herkese açık kullanımını onayla</button>
            </form>
          )}
        </article>
      ))}
    </section>
  );
}
