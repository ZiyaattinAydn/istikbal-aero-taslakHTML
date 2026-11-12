import "server-only";

/** Keep invitation validation identical across OTP request and verification. */
export function allowedCmsEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 254) return false;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return false;
  return (process.env.CMS_ALLOWED_EMAILS || "")
    .split(",")
    .some((entry) => entry.trim().toLowerCase() === email);
}
