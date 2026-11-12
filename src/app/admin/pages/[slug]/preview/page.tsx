import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/server";
import { pageSchema } from "@/lib/cms/pages";
import { PagePreviewRuntime } from "@/components/admin/PagePreviewRuntime";
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
  return (
    <PagePreviewRuntime
      page={route.page}
      fields={schema.fields}
      initialValues={values}
    />
  );
}
