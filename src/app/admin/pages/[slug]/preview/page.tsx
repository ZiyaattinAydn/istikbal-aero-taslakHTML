import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { pageSchema } from "@/lib/cms/pages";
import { PageContent } from "@/components/pages/PageContent";
import { SiteShell } from "@/components/layout/SiteShell";
import { getRoute } from "@/data/routes";
export default async function Preview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { db } = await requireAdmin();
  const { slug } = await params;
  const schema = pageSchema(slug),
    route = getRoute(slug);
  if (!schema || !route) notFound();
  const { data } = await db
    .from("cms_documents")
    .select("body")
    .eq("kind", "page")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();
  return (
    <SiteShell page={route.page}>
      <PageContent
        page={route.page}
        content={Object.fromEntries(
          Object.entries(data.body.fields || {}).map(([k, v]) => [
            k,
            typeof v === "string" && v.startsWith("cms:")
              ? v.replace("cms:", "cms-preview:")
              : String(v),
          ]),
        )}
      />
    </SiteShell>
  );
}
