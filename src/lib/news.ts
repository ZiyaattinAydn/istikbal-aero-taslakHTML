import { publicNews } from '@/data/publications';
export function findNews(query: string | string[] | undefined, flightControl = false) {
  const value = Array.isArray(query) ? query[0] : query;
  const id = value || (flightControl ? 'flight-controller-announcement' : 'tengri-ai-announcement');
  if (id.length > 120 || !/^[a-z0-9-]+$/.test(id)) return undefined;
  return publicNews.find(item => item.id === id);
}
