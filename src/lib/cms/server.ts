import "server-only";
import { CMS_AUTH_COOKIE_OPTIONS } from "@/lib/cms/cookie-policy";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
export function cmsConfigured() {
  return (
    process.env.CMS_ENABLED === "true" &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_PUBLISHABLE_KEY
  );
}
export async function cmsClient() {
  if (!cmsConfigured()) notFound();
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: CMS_AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          for (const { name, value, options } of items) {
            try {
              jar.set(name, value, options);
            } catch {
              /* Server components cannot rotate cookies; actions can. */
            }
          }
        },
      },
    },
  );
}
export async function requireAdmin(mfa = true) {
  const db = await cmsClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: role, error: roleError } = await db
    .from("cms_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (roleError || !role || !["editor", "publisher"].includes(role.role))
    notFound();
  if (mfa) {
    const { data, error } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || data?.currentLevel !== "aal2") redirect("/admin/mfa");
  }
  return { db, user, role: role.role as "editor" | "publisher" };
}
