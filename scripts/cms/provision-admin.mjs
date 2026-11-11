// Operator-only, idempotent Auth Admin provisioning for the EXISTING project.
// Never used by the application. Never print Auth errors, keys, email or user IDs.
import { createClient } from "@supabase/supabase-js";
const projectUrl = "https://uftnykormtwlzolwbhfb.supabase.co";
const email = (process.env.CMS_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (
  !key ||
  !email ||
  email.length > 254 ||
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
) {
  console.error(
    "Private SUPABASE_SERVICE_ROLE_KEY and CMS_BOOTSTRAP_EMAIL are required in the operator environment. Nothing changed.",
  );
  process.exit(1);
}
const db = createClient(projectUrl, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let stage = "lookup";
try {
  let user;
  for (let page = 1; page <= 10; page++) {
    const result = await db.auth.admin.listUsers({ page, perPage: 100 });
    if (result.error) throw Error("lookup_failed");
    user = result.data.users.find((u) => u.email?.toLowerCase() === email);
    if (user || result.data.users.length < 100) break;
    if (page === 10) throw Error("lookup_limit");
  }
  if (!user) {
    stage = "create";
    const result = await db.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (result.error) throw Error("create_failed");
    user = result.data.user;
  }
  stage = "role";
  const result = await db
    .from("cms_roles")
    .select("role,active")
    .eq("user_id", user.id)
    .single();
  if (result.error || result.data.role !== "publisher" || !result.data.active)
    throw Error("role_failed");
  console.log(
    "Authorized passwordless publisher account exists. No email was sent. The user must complete OTP and their own TOTP enrollment after SMTP setup.",
  );
} catch {
  console.error(
    "Auth Admin provisioning stopped at stage " +
      stage +
      ". No credentials or account details logged. Check the project allowlist and operator authorization.",
  );
  process.exitCode = 1;
}
