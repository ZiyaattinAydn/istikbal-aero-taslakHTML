import Link from "next/link";
import { redirect } from "next/navigation";
import { cmsConfigured, cmsClient } from "@/lib/cms/server";
import { LoginForms } from "@/components/admin/AuthForms";

export default async function Login() {
  const ready = cmsConfigured();
  if (ready) {
    const db = await cmsClient();
    const { data: { user } } = await db.auth.getUser();
    if (user) {
      const { data: role } = await db
        .from("cms_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("active", true)
        .maybeSingle();
      if (role && ["editor", "publisher"].includes(role.role)) {
        const { data: assurance } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance?.currentLevel === "aal2") redirect("/admin");
        redirect("/admin/mfa");
      }
    }
  }
  return (
    <section className="cms-auth-page">
      <span className="cms-eyebrow">GÜVENLİ YÖNETİM ERİŞİMİ</span>
      <h1>Tekrar hoş geldiniz.</h1>
      <p className="cms-auth-description">
        İstikbal Aerospace içerik yönetim sistemine şifresiz ve iki adımlı güvenli giriş.
      </p>
      {ready ? (
        <LoginForms />
      ) : (
        <div className="cms-notice" role="status">
          Yönetim girişi henüz kullanıma açılmadı.
        </div>
      )}
      <Link className="cms-auth-back" href="/">← Kurumsal siteye dön</Link>
    </section>
  );
}
