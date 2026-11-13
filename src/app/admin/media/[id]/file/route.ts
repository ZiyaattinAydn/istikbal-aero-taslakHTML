import { requireAdmin } from "@/lib/cms/server";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { db } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const { data } = await db
    .from("cms_media")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  if (!data) return new Response(null, { status: 404 });
  const { data: file, error } = await db.storage
    .from("cms-media")
    .download(data.path);
  if (error || !file) return new Response(null, { status: 404 });
  return new Response(file, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
