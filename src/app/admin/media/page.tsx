import { requireAdmin } from "@/lib/cms/server";
import { siteMedia } from "@/lib/cms/site-media";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { MediaLibraryGallery } from "@/components/admin/MediaLibraryGallery";

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
          <p>Mevcut site görsellerini ve yeni yüklemelerinizi tek yerden görüntüleyin, arayın ve yönetin.</p>
        </div>
        <span className="cms-page-count">{siteMedia.length + (data?.length || 0)} görsel</span>
      </div>
      <details className="cms-media-upload-panel cms-media-upload-collapsible">
        <summary>
          <span className="cms-media-upload-summary-text">
            <strong>＋ Yeni görsel yükle</strong>
            <small>Bilgisayarınızdan görsel ekleyin veya sayfa editöründen doğrudan yükleyin.</small>
          </span>
          <span className="cms-media-upload-expand" aria-hidden="true">⌄</span>
        </summary>
        <div className="cms-media-upload-body">
          <p>PNG, JPEG veya WebP ekleyebilirsiniz. Kullanım izninizi onayladığınız yüklemeler önce özel saklanır.</p>
          <MediaUpload />
        </div>
      </details>
      {error && <p role="alert">Yüklenen görseller alınamadı; mevcut site görselleri listelenmeye devam ediyor.</p>}
      <MediaLibraryGallery media={data || []} publisher={role === "publisher"} />
    </section>
  );
}
