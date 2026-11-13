import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { MfaForm } from "@/components/admin/AuthForms";

export default async function Mfa() {
  const { db } = await requireAdmin(false);
  const { data: assurance } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel === "aal2") redirect("/admin");
  const { data } = await db.auth.mfa.listFactors();
  return (
    <section className="cms-auth-page">
      <span className="cms-eyebrow">HESAP GÜVENLİĞİ · 02 / 02</span>
      <h1>İkinci adım doğrulama</h1>
      <p className="cms-auth-description">
        İçerik ve yayın yetkileriniz doğrulama uygulamanızla korunur.
      </p>
      <MfaForm factors={data?.totp.filter((f) => f.status === "verified") || []} />
    </section>
  );
}
