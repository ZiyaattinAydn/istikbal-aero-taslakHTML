import Link from "next/link";
import type { CanonicalPageReference } from "@/lib/cms/legacy-content";

export type CanonicalPageItem = CanonicalPageReference & {
  id?: string;
  status?: string;
};

const kinds: Record<string, string> = {
  news: "Haber ve duyuru",
  project: "Proje ve AR-GE",
  platform: "Platform",
  technology: "Teknoloji",
};

const statusText: Record<string, string> = {
  draft: "Taslak",
  in_review: "İncelemede",
  approved: "Yayına hazır",
  published: "Yayında",
  archived: "Arşiv",
};

export function CanonicalContentPanel({
  items,
}: {
  items: readonly CanonicalPageItem[];
}) {
  if (items.length === 0) return null;

  const linked = items.filter((item) => item.id).length;
  return (
    <section className="cms-canonical-panel" aria-labelledby="cms-canonical-heading">
      <div className="cms-canonical-panel-heading">
        <div>
          <span className="cms-eyebrow">BU SAYFADAKİ ORTAK İÇERİKLER</span>
          <h2 id="cms-canonical-heading">Bir kez düzenleyin, her yerde güncellensin.</h2>
          <p>
            Haberler, projeler ve platformlar birden fazla sayfada görünebilir.
            {linked
              ? " Aktarılan içeriklerin metinlerini aşağıdaki tekil kayıtlarından düzenleyebilirsiniz."
              : " Bu kayıtlar henüz aktarılmadığı için mevcut sayfa alanları aşağıda düzenlenebilir."}
          </p>
        </div>
        <span className="cms-canonical-count">{linked} / {items.length} bağlı</span>
      </div>
      <div className="cms-canonical-cards">
        {items.map((item) => (
          <article
            key={item.kind + ":" + item.slug}
            className="cms-canonical-card"
            id={"cms-canonical-" + item.kind + "-" + item.slug}
          >
            <div className="cms-canonical-card-meta">
              <span>{kinds[item.kind] || "İçerik"}</span>
              <span className={"cms-canonical-status" + (item.status === "published" ? " is-published" : "")}>
                {item.id ? statusText[item.status || "draft"] || "Taslak" : "Aktarım bekliyor"}
              </span>
            </div>
            <h3>{item.title}</h3>
            {item.id ? (
              <>
                <p>
                  Bu içeriğin ortak başlık, açıklama ve görsel alanları kendi kaydından yönetilir.
                  {item.status !== "published"
                    ? " Sitede görünmesi için yayın işlemini tamamlayın."
                    : " Yayınlanan değişiklikler ilgili sayfalara yansır."}
                </p>
                <Link href={"/admin/content/" + item.id} className="cms-canonical-action">
                  İçeriği düzenle ↗
                </Link>
              </>
            ) : (
              <p>
                Bu içerik için tekil kayıt henüz hazırlanmadı. Veriler korunuyor;
                sayfa içindeki mevcut alanları düzenlemeye devam edebilirsiniz.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
