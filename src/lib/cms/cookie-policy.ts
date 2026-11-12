/**
 * Admin-only HttpOnly session cookie policy.
 * Session validity is still governed by Supabase Auth: the browser cookie
 * lifetime is not an authorization grant. SQL always checks a fresh session
 * and AAL2 before privileged operations.
 */
export const CMS_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const CMS_AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: CMS_COOKIE_MAX_AGE_SECONDS,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
};
