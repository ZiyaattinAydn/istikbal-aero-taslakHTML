import Link from "next/link";
import { cmsConfigured } from "@/lib/cms/server";
import { LoginForms } from "@/components/admin/AuthForms";
export default function Login() {
  return (
    <section>
      <h1>Yönetici girişi</h1>
      {cmsConfigured() ? (
        <LoginForms />
      ) : (
        <p>Yönetim girişi henüz kullanıma açılmadı.</p>
      )}
      <Link href="/">Siteye dön</Link>
    </section>
  );
}
