import { publishedPage } from "@/lib/cms/public";
import { legacyPublicPageContent } from "@/lib/cms/legacy-public";
import { getRoute } from "@/data/routes";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageContent } from "@/components/pages/PageContent";
const route = getRoute("index")!;
const defaultMetadata = {
  title: route.title,
  description: route.description,
  openGraph: {
    title: route.title,
    description: route.description,
    type: "website",
  },
};
export async function generateMetadata() {
  const content = await publishedPage("index");
  return content
    ? { ...defaultMetadata, title: content.title, description: content.summary }
    : defaultMetadata;
}
export default async function Home() {
  const content = await publishedPage("index");
  const fields = await legacyPublicPageContent("index", content?.fields);
  return (
    <SiteShell page="home">
      <link
        rel="preload"
        as="image"
        href="/assets/hero-flight.webp"
        fetchPriority="high"
      />
      <PageContent page="home" content={fields} />
    </SiteShell>
  );
}
