import { getRoute } from '@/data/routes';
import { SiteShell } from '@/components/layout/SiteShell';
import { PageContent } from '@/components/pages/PageContent';
const route = getRoute('index')!;
export const metadata = { title: route.title, description: route.description, openGraph: { title: route.title, description: route.description, type: 'website' } };
export default function Home() { return <SiteShell page="home"><link rel="preload" as="image" href="/assets/hero-flight.webp" fetchPriority="high" /><PageContent page="home" /></SiteShell>; }
