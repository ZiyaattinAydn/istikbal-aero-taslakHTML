import { publishedPage } from "@/lib/cms/public";
import { legacyPublicPageContent } from "@/lib/cms/legacy-public";
import { PublishedCards } from "@/components/pages/PublishedCards";
import { notFound } from "next/navigation";
import { getRoute, routes } from "@/data/routes";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageContent } from "@/components/pages/PageContent";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const dynamicParams = true;
export function generateStaticParams() {
  return routes.flatMap((route) => [
    { slug: route.slug },
    { slug: route.file },
  ]);
}
export async function generateMetadata({ params }: Props) {
  const route = getRoute((await params).slug);
  if (!route) return { title: "Sayfa Bulunamadı | İstikbal Aerospace" };
  const content = await publishedPage(route.slug);
  return {
    title: content?.title || route.title,
    description: content?.summary || route.description,
    openGraph: {
      title: content?.title || route.title,
      description: content?.summary || route.description,
      type: "website" as const,
    },
  };
}
export default async function ContentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const route = getRoute(slug);
  if (!route) notFound();
  const content = await publishedPage(route.slug);
  const newsId =
    route.page === "newsDetail" || route.page === "flightControlNews"
      ? (await searchParams).id
      : undefined;
  const fields = await legacyPublicPageContent(route.slug, content?.fields, newsId);
  return (
    <SiteShell
      key={slug + ":" + (Array.isArray(newsId) ? newsId[0] : newsId || "")}
      page={route.page}
    >
      {route.page === "home" && (
        <link
          rel="preload"
          as="image"
          href="/assets/hero-flight.webp"
          fetchPriority="high"
        />
      )}
      <PageContent
        page={route.page}
        newsId={newsId}
        content={fields}
      />
      <PublishedCards page={route.page} />
    </SiteShell>
  );
}
