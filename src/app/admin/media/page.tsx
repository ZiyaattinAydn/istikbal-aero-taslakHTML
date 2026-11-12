import { requireAdmin } from "@/lib/cms/server";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { MediaEditor } from "@/components/admin/MediaEditor";

export default async function Media() {
  const { db, role } = await requireAdmin();
  const { data, error } = await db
    .from("cms_media")
    .select("id,alt,caption,revision,bytes,width,height,visibility")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <section className="cms-media-page">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">DİJİTAL VARLIKLAR / KÜTÜPHANE</div>
          <h1>Medya kütüphanesi</h1>
          <p>Görselleri güvenli şekilde yükleyin, alternatif metinlerini düzenleyin ve yayın izinlerini yönetin.</p>
        </div>
        <span className="cms-page-count">{data?.length ?? 0} görsel</span>
      </div>
      <div className="cms-media-upload-panel">
        <h2>Görsel yükle</h2>
        <p>Yalnızca kullanma hakkınız olan görselleri yükleyin. Yükleme sonrasında dosyalar önce özel kalır.</p>
        <MediaUpload />
      </div>
      {error && <p role="alert">Kütüphane yüklenemedi.</p>}
      {!error && !data?.length && (
        <div className="cms-empty-state"><h3>Henüz görsel yok.</h3><p>İlk görselinizi yukarıdan yükleyebilirsiniz.</p></div>
      )}
      <div className="cms-media-grid">
        {data?.map((item) => (
          <article className="cms-media-card" key={item.id}>
            <div className="cms-media-card-top">
              <h2>{item.alt}</h2>
              <span className={"cms-status-badge cms-status-" + (item.visibility === "public" ? "published" : "draft")}>
                {item.visibility === "public" ? "Yayın izni açık" : "Özel"}
              </span>
            </div>
            <a className="cms-media-view" href={"/admin/media/" + item.id + "/file"} target="_blank" rel="noreferrer">
              Görseli görüntüle ↗
            </a>
            <p className="cms-media-meta">{item.width} × {item.height} piksel · {Math.ceil(item.bytes / 1024)} KB</p>
            <MediaEditor key={item.revision} media={item} publisher={role === "publisher"} />
          </article>
        ))}
      </div>
    </section>
  );
}
