import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { pageSchema } from "@/lib/cms/pages";
import { PageContent } from "@/components/pages/PageContent";
import { PagePreviewBridge } from "@/components/admin/PagePreviewBridge";
import { SiteShell } from "@/components/layout/SiteShell";
import { getRoute } from "@/data/routes";
import type { PageValues } from "@/lib/cms/page-values";

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
  const values = (data.body.fields || {}) as PageValues;
  const content = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" && value.startsWith("cms:")
        ? value.replace("cms:", "cms-preview:")
        : String(value),
    ]),
  );
  return (
    <>
      <SiteShell page={route.page}>
        <PageContent page={route.page} content={content} />
      </SiteShell>
      <PagePreviewBridge fields={schema.fields} values={values} />
    </>
  );
}
