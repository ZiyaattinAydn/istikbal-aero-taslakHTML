import { requireAdmin } from "@/lib/cms/server";
import { SecurityMfa } from "@/components/admin/SecurityMfa";

export default async function SecurityPage() {
  const { db } = await requireAdmin();
  const { data, error } = await db.auth.mfa.listFactors();
  return (
    <section className="cms-security-page">
      <div className="cms-page-heading">
        <div>
          <div className="cms-eyebrow">HESAP AYARLARI / GÜVENLİK</div>
          <h1>Hesap güvenliği</h1>
          <p>Doğrulama uygulamalarınızı yönetin. İki adımlı doğrulama içerik ve yayın işlemleri için zorunludur.</p>
        </div>
      </div>
      {error ? (
        <p role="alert">Doğrulama cihazları alınamadı.</p>
      ) : (
        <SecurityMfa factors={data?.totp.filter((f) => f.status === "verified") || []} />
      )}
    </section>
  );
}
