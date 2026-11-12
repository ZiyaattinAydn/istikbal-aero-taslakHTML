import { createServerClient } from "@supabase/ssr";
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
      cookieOptions: {
        httpOnly: true,
        // Keep the browser session across restarts; Supabase still controls token validity.
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/admin",
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          for (const { name, value } of items) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.headers.set("Cache-Control", "private, no-store, max-age=0");
          for (const { name, value, options } of items)
            response.cookies.set(name, value, options);
        },
      },
    },
  );
  await db.auth.getUser();
  return response;
}
export const config = { matcher: ["/admin/:path*"] };
