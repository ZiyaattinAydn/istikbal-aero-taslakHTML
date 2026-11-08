import type { PageId } from '@/data/routes';
import { HomeContent } from './HomeContent';
import { PlatformsContent } from './PlatformsContent';
import { TechContent } from './TechContent';
import { CapabilitiesContent } from './CapabilitiesContent';
import { TengriContent } from './TengriContent';
import { ProjectsContent } from './ProjectsContent';
import { NewsContent } from './NewsContent';
import { AboutContent } from './AboutContent';
import { ContactContent } from './ContactContent';
import { PlatformDetailContent } from './PlatformDetailContent';
import { ProjectDetailContent } from './ProjectDetailContent';
import { NewsDetailContent } from './NewsDetailContent';
import { FocusContent, PlatformFocusContent } from './FocusContent';
import { findNews } from '@/lib/news';
export function PageContent({ page, newsId }: { page: PageId; newsId?: string | string[] }) {
  switch (page) {
    case 'home': return <HomeContent />;
    case 'platforms': return <PlatformsContent />;
    case 'tech': return <TechContent />;
    case 'capabilities': return <CapabilitiesContent />;
    case 'tengri': return <TengriContent />;
    case 'projects': return <ProjectsContent />;
    case 'news': return <NewsContent />;
    case 'about': return <AboutContent />;
    case 'contact': return <ContactContent />;
    case 'platformDetail': return <PlatformDetailContent />;
    case 'projectDetail': return <ProjectDetailContent />;
    case 'newsDetail': case 'flightControlNews': return <NewsDetailContent item={findNews(newsId, page === 'flightControlNews')} />;
    case 'iha': case 'flightArch': case 'airDefense': return <PlatformFocusContent name={page} />;
    case 'autonomy': case 'embedded': case 'sensors': case 'rockets': case 'communications': return <FocusContent name={page} />;
  }
}
