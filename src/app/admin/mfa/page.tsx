import { requireAdmin } from "@/lib/cms/server";
import { MfaForm } from "@/components/admin/AuthForms";
export default async function Mfa() {
  const { db } = await requireAdmin(false);
  const { data } = await db.auth.mfa.listFactors();
  return (
    <section>
      <h1>İkinci adım doğrulama</h1>
      <MfaForm
        factors={data?.totp.filter((f) => f.status === "verified") || []}
      />
    </section>
  );
}
