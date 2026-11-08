'use client';
import { useEffect, useState, type RefObject } from 'react';

export function useNavigationFit(ref: RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const inner = header.querySelector<HTMLElement>('.header-inner');
    const nav = header.querySelector<HTMLElement>('.desktop-nav');
    const brand = header.querySelector<HTMLElement>('.brand');
    const tools = header.querySelector<HTMLElement>('.header-tools');
    if (!inner || !nav || !brand || !tools) return;
    const mobile = matchMedia('(hover: none) and (pointer: coarse)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, disposed = false;
    function measure() {
      frame = 0;
      if (disposed || !inner || !nav || !brand || !tools) return;
      if (mobile.matches || !fine.matches) { setCompact(false); return; }
      const styles = getComputedStyle(nav), outer = getComputedStyle(inner);
      const needed = Array.from(nav.children).reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
        + Math.max(0, nav.children.length - 1) * (parseFloat(styles.columnGap) || 0);
      const available = inner.clientWidth - (parseFloat(outer.paddingLeft) || 0) - (parseFloat(outer.paddingRight) || 0)
        - Math.max(brand.getBoundingClientRect().width, brand.scrollWidth)
        - Math.max(tools.getBoundingClientRect().width, tools.scrollWidth) - 2 * (parseFloat(outer.columnGap) || 0);
      setCompact(previous => needed > available - (previous ? 16 : 6));
    }
    const queue = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(queue);
    [inner, brand, tools].forEach(el => observer.observe(el));
    window.addEventListener('resize', queue, { passive: true });
    window.visualViewport?.addEventListener('resize', queue, { passive: true });
    mobile.addEventListener('change', queue); fine.addEventListener('change', queue);
    document.fonts.addEventListener('loadingdone', queue);
    void document.fonts.ready.then(queue);
    queue();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('resize', queue); window.visualViewport?.removeEventListener('resize', queue);
      mobile.removeEventListener('change', queue); fine.removeEventListener('change', queue);
      document.fonts.removeEventListener('loadingdone', queue);
    };
  }, [ref]);
  return compact;
}
