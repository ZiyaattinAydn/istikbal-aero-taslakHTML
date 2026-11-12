import { createServerClient } from "@supabase/ssr";
import { CMS_AUTH_COOKIE_OPTIONS, boundedCmsCookieOptions } from "@/lib/cms/cookie-policy";
import { NextResponse, type NextRequest } from "next/server";
// Only admin traffic refreshes auth; public pages never invoke Supabase.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  if (
    process.env.CMS_ENABLED !== "true" ||
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_PUBLISHABLE_KEY
  )
    return response;
  const db = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: CMS_AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          for (const { name, value } of items) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.headers.set("Cache-Control", "private, no-store, max-age=0");
          for (const { name, value, options } of items)
            response.cookies.set(name, value, boundedCmsCookieOptions(options));
        },
      },
    },
  );
  await db.auth.getUser();
  return response;
}
export const config = { matcher: ["/admin/:path*"] };
