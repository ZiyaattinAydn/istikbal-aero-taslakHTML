import { SiteLink } from "@/components/ui/SiteLink";
export default function NotFound() {
  return (
    <main className="not-found-page">
      <small>İSTİKBAL AEROSPACE · 404</small>
      <h1>Aradığınız sayfa bulunamadı.</h1>
      <p>
        Bağlantı değişmiş veya içerik kaldırılmış olabilir. Ana sayfadan devam
        edebilirsiniz.
      </p>
      <SiteLink className="btn solid" href="/">
        Ana Sayfaya Dön ↗
      </SiteLink>
    </main>
  );
}
