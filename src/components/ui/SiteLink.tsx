import Link from 'next/link';
import type { ComponentProps } from 'react';

/** Preserve all published .html URLs while using App Router navigation. */
export function SiteLink({ href, ...props }: ComponentProps<typeof Link>) {
  const normalized = typeof href === 'string' && /^[a-z0-9-]+\.html/.test(href) ? '/' + href : href;
  return <Link href={normalized} prefetch={false} {...props} />;
}
