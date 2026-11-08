'use client';
import { useState } from 'react';
import { publicNews } from '@/data/publications';
import { NewsCard } from '@/components/cards/Cards';
const filters = [['all', 'Tümü'], ['Paylaşım', 'Paylaşımlar'], ['Duyuru', 'Duyurular']] as const;
export function NewsList() {
  const [filter, setFilter] = useState<string>('all');
  const empty = !publicNews.some(item => filter === 'all' || item.category === filter);
  return <><div className="listing-toolbar"><div className="filter-group">{filters.map(([key, label]) => <button type="button" key={key} className="filter" data-filter={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div><span className="count">YAYINLAR</span></div><div className="cards-3 filter-target editorial-grid">{publicNews.map(item => <NewsCard key={item.id} hidden={filter !== 'all' && item.category !== filter} {...item} description={item.summary} href={item.href || `haber-detay.html?id=${encodeURIComponent(item.id)}`} />)}</div><p className="filter-empty editorial-note" hidden={!empty} role="status">Bu kategoride yayımlanmış bir içerik bulunmuyor.</p></>;
}
