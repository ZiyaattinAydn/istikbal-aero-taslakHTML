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

/**
 * Supabase SSR may pass a 400-day storage-cookie lifetime to setAll even
 * when createServerClient receives a shorter cookieOptions.maxAge.
 * Apply this bound at the HTTP Set-Cookie boundary as well.
 *
 * Preserve maxAge=0 / expired cookies for sign-out and token removal.
 */
export function boundedCmsCookieOptions<T extends { maxAge?: number; expires?: Date }>(
  options: T,
) {
  const expired =
    options.maxAge === 0 ||
    (options.expires instanceof Date && options.expires.getTime() <= Date.now());
  const rest = { ...options };
  delete rest.expires;
  const maxAge = expired
    ? 0
    : Math.min(
        CMS_COOKIE_MAX_AGE_SECONDS,
        Math.max(0, options.maxAge ?? CMS_COOKIE_MAX_AGE_SECONDS),
      );
  return {
    ...rest,
    ...CMS_AUTH_COOKIE_OPTIONS,
    maxAge,
    expires: expired ? new Date(0) : new Date(Date.now() + maxAge * 1000),
  };
}
