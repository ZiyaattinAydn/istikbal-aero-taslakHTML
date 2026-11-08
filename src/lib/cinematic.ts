import { EventScope } from './events';
import type { PageId } from '@/data/routes';
/** Ported from main@dc00abb motion.js; each route owns and disposes its effects. */
export function mountCinematic(root: HTMLElement, page: PageId): () => void {
const $ = (selector: string) => root.querySelector<HTMLElement>(selector);
const home = page === 'home';
const scope = new EventScope();
let disposed = false;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
// Browser zoom changes CSS viewport width without changing the physical input device.
// Use pointer capability—not the responsive breakpoint—to retain wheel chapters.
const desktopMouse = matchMedia('(hover: hover) and (pointer: fine)');
const header = $('.site-header');
const hero = $('.hero-story');
const stage = $('.hero-stage');
const sections = [...root.querySelectorAll<HTMLElement>('main > section'), $('.footer')].filter((node): node is HTMLElement => node !== null);
const chapterButtons = home ? [...root.querySelectorAll<HTMLElement>('.chapter-step')] : [];
const chapterNav = home ? $('.chapter-nav') : null;
const chapterToggle = home ? $('.chapter-nav-toggle') : null;
let travel: {
    kind: string;
    direction: number;
    target: number;
} | null = null;
let raf = 0;
let lastWheel = -Infinity;
let tailUntil = 0;
let tailDirection = 0;
let touchpadGesture = false;
let geometry: {
    section: HTMLElement;
    at: number;
    extra: number;
}[] | null = null;
let sceneRAF = 0;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const easeQuint = (t: number) => t * t * t * (10 + t * (-15 + 6 * t));
const heightOfHeader = () => header?.getBoundingClientRect().height || 82;
function renderHero() {
    sceneRAF = 0;
    if (!hero || !stage)
        return;
    if (reduced.matches) {
        hero.style.setProperty('--scene-progress', '0');
        hero.style.setProperty('--story-copy-fade', '0');
        return;
    }
    const top = hero.getBoundingClientRect().top + scrollY - heightOfHeader();
    const pinDistance = Math.max(1, hero.offsetHeight - stage.offsetHeight);
    const travelInHero = clamp(scrollY - top, 0, pinDistance);
    // Complete the blend while the entire hero is still visibly pinned.
    const progress = easeQuint(clamp(travelInHero / (pinDistance * .91), 0, 1));
    hero.style.setProperty('--scene-progress', progress.toFixed(4));
    hero.style.setProperty('--story-copy-fade', clamp((progress - .65) / .35, 0, 1).toFixed(4));
}
function queueHero() {
    if (!sceneRAF)
        sceneRAF = requestAnimationFrame(renderHero);
}
scope.on(window, 'scroll', queueHero, { passive: true });
scope.on(window, 'resize', queueHero, { passive: true });
/* Reveal content only on first encounter. Never hide it when scrolling back up. */
const actors: HTMLElement[] = [];
const seen = new Set<HTMLElement>();
function pick(selector: string, side = 0, baseDelay = 0, step = 85) {
    root.querySelectorAll<HTMLElement>(selector).forEach((node, i) => {
        if (seen.has(node))
            return;
        seen.add(node);
        node.classList.add('cinematic-actor');
        node.style.setProperty('--actor-x', `${side === 0 ? (i % 2 ? 26 : -26) : side * 29}px`);
        node.style.setProperty('--actor-delay', `${Math.min(300, baseDelay + i * step)}ms`);
        actors.push(node);
    });
}
// Explicit text-level actors make the title, copy and CTA appear in sequence.
pick('.intro > div', 0, 70, 130);
pick('.section-header .eyebrow', -1, 25, 0);
pick('.section-header h2', -1, 85, 0);
pick('.section-header p', 1, 150, 0);
pick('.section-header > .btn', 1, 210, 0);
pick('.platform-card', 0, 110, 110);
pick('.tech-card', 0, 70, 85);
pick('.tengri-inner > .eyebrow', -1, 40, 0);
pick('.tengri-inner > h2', -1, 125, 0);
pick('.tengri-inner > p, .tengri-inner > .btn, .tengri-inner > .tengri-outline', 1, 170, 60);
pick('.split-feature > .visual, .feature-row > .feature-art', -1, 65, 0);
pick('.split-feature > .copy, .feature-row > .feature-copy', 1, 120, 0);
pick('.news-feature-art', -1, 80, 0);
pick('.news-feature-copy', 1, 125, 0);
pick('.news-card, .module, .step, .list-card', 0, 75, 65);
pick('.focus-intro > *, .corporate-identity > *', 0, 65, 65);
pick('.cta-flex > *', 0, 65, 110);
pick('.footer-columns > div', 0, 40, 70);
pick('.footer-bottom > *', 0, 80, 70);
pick('.inner-hero .wrapper > .eyebrow, .inner-hero .wrapper > h1, .inner-hero .wrapper > p', -1, 45, 80);
let observer: IntersectionObserver | undefined;
function revealOnce(node: HTMLElement) {
    if (node.dataset.actorState === 'in')
        return;
    node.dataset.actorState = 'in';
    node.dataset.actorArrival = 'down';
    observer?.unobserve(node);
}
function connectObserver() {
    observer?.disconnect();
    if (reduced.matches || !('IntersectionObserver' in window)) {
        for (const node of actors)
            revealOnce(node);
        return;
    }
    const bar = heightOfHeader();
    for (const node of actors) {
        // Already visited actors stay visible through resize and direction changes.
        if (node.dataset.actorState === 'in')
            continue;
        const rect = node.getBoundingClientRect();
        if (rect.bottom <= bar + 6) {
            // A direct load at a deep scroll position must not hide earlier sections.
            node.dataset.actorState = 'in';
        }
        else {
            node.dataset.actorState = 'below';
        }
    }
    root.classList.add('cinematic-ready');
    observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting)
                revealOnce(entry.target as HTMLElement);
        }
    }, { rootMargin: '-' + (bar + 6) + 'px 0px -10% 0px', threshold: 0.04 });
    for (const node of actors) {
        if (node.dataset.actorState !== 'in')
            observer.observe(node);
    }
}
connectObserver();
function sectionStops() {
    if (geometry)
        return geometry;
    const y = scrollY;
    const bar = heightOfHeader();
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    geometry = [];
    for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const begin = clamp(Math.round(rect.top + y - bar), 0, maximum);
        const extra = rect.height - (innerHeight - bar);
        geometry.push({ section, at: begin, extra });
    }
    return geometry;
}
function stopMovement() {
    cancelAnimationFrame(raf);
    raf = 0;
    travel = null;
}
function stopByUser() {
    stopMovement();
    tailDirection = 0;
    tailUntil = 0;
}
function animateTo(target: number, kind = 'section') {
    stopMovement();
    const from = scrollY;
    target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target));
    if (reduced.matches || Math.abs(target - from) < 2) {
        scrollTo({ top: target, behavior: 'instant' });
        return;
    }
    const distance = Math.abs(target - from);
    // Hero has a long, intentional crossfade; other section steps remain soft and readable.
    const duration = kind === 'hero' ? 2050 : kind === 'top' ? 1250 : kind === 'jump' ? clamp(800 + distance * .075, 1000, 1600) : clamp(900 + distance * .17, 1070, 1450);
    const direction = Math.sign(target - from);
    travel = { kind, direction, target };
    const started = performance.now();
    function frame(now: number) {
        const t = clamp((now - started) / duration, 0, 1);
        const next = from + (target - from) * easeQuint(t);
        scrollTo({ top: next, behavior: 'instant' });
        if (t < 1)
            raf = requestAnimationFrame(frame);
        else {
            scrollTo({ top: target, behavior: 'instant' });
            stopMovement();
            tailDirection = direction;
            tailUntil = now + 300;
        }
    }
    raf = requestAnimationFrame(frame);
}
/* Fixed chapter navigator: labels are exposed on hover/focus, and every dot
   jumps directly to its section without changing page or wheel-step semantics. */
let chapterRAF = 0;
function refreshChapterState() {
    chapterRAF = 0;
    if (!home || !chapterButtons.length)
        return;
    const stops = sectionStops();
    if (stops.length < chapterButtons.length)
        return;
    const referenceY = scrollY + Math.min(180, innerHeight * .18);
    let active = 0;
    for (let i = 0; i < chapterButtons.length; i++) {
        if (stops[i].at <= referenceY)
            active = i;
    }
    for (const [index, button] of chapterButtons.entries()) {
        const selected = index === active;
        button.classList.toggle('is-active', selected);
        if (selected)
            button.setAttribute('aria-current', 'location');
        else
            button.removeAttribute('aria-current');
    }
}
function queueChapterState() {
    if (!chapterRAF)
        chapterRAF = requestAnimationFrame(refreshChapterState);
}
function closeChapterMenu() {
    chapterNav?.classList.remove('is-open');
    chapterToggle?.setAttribute('aria-expanded', 'false');
}
if (home && chapterButtons.length) {
    chapterButtons.forEach(button => scope.on(button, 'click', () => {
        const index = Number(button.dataset.chapterIndex);
        const target = sectionStops()[index];
        if (!target)
            return;
        closeChapterMenu();
        animateTo(target.at, 'jump');
        queueChapterState();
    }));
    scope.on(chapterToggle, 'click', () => {
        const opened = chapterNav?.classList.toggle('is-open');
        chapterToggle?.setAttribute('aria-expanded', String(opened));
    });
    scope.on(document, 'keydown', event => {
        if (event.key === 'Escape')
            closeChapterMenu();
    });
    scope.on(document, 'pointerdown', event => {
        if (chapterNav && !chapterNav.contains(event.target as Node))
            closeChapterMenu();
    });
    scope.on(window, 'scroll', queueChapterState, { passive: true });
    scope.on(window, 'resize', queueChapterState, { passive: true });
    queueChapterState();
}
function stepScene(dir: number) {
    const stops = sectionStops();
    if (!stops.length)
        return false;
    const y = scrollY;
    let index = 0;
    for (let i = 0; i < stops.length; i++)
        if (stops[i].at <= y + 8)
            index = i;
    const current = stops[index];
    // Exception: very tall sections should keep their bottom content readable.
    // These additional stops are only used if the section exceeds a viewport by >~160px.
    if (dir > 0) {
        if (index !== 0 && current.extra > 160) {
            const end = current.at + current.extra;
            if (y < end - 15) {
                animateTo(Math.min(end, y + innerHeight * .84), 'section');
                return true;
            }
        }
        const next = stops.find(x => x.at > y + 18);
        if (!next)
            return false;
        animateTo(next.at, index === 0 ? 'hero' : 'section');
        return true;
    }
    if (y > current.at + 18) {
        animateTo(current.at, 'section');
        return true;
    }
    for (let i = index - 1; i >= 0; i--) {
        const prev = stops[i];
        if (prev.at < y - 18) {
            const trailing = i !== 0 && prev.extra > 160 ? Math.max(prev.at, prev.at + prev.extra) : prev.at;
            animateTo(trailing, i === 0 ? 'hero' : 'section');
            return true;
        }
    }
    return false;
}
function onWheel(event: WheelEvent) {
    // On inner pages the browser owns all scrolling; only the cinematic homepage
    // retains its deliberately stepped mouse-wheel chapter experience.
    if (!home || !event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        (event.target as Element | null)?.closest('input, textarea, select, [contenteditable], [data-native-scroll], .mega.open, .mobile-nav.open') ||
        $('.mega.open, .mobile-nav.open'))
        return;
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    if (gap > 210)
        touchpadGesture = false;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const dir = Math.sign(delta);
    if (!dir)
        return;
    // A physical mouse wheel can report fractional/smaller deltas at 125–300% browser zoom.
    // Do not classify a wheel as a touchpad solely because its delta is non-integer.
    if (event.deltaMode === 0 && (Math.abs(delta) < 18 || Math.abs(event.deltaX) > 4))
        touchpadGesture = true;
    if (touchpadGesture) {
        // Touchpads retain native momentum, and do not get forced through wheel steps.
        stopMovement();
        return;
    }
    if (travel) {
        event.preventDefault();
        if (travel.direction === dir)
            return;
        stopMovement();
    }
    if (dir === tailDirection && now < tailUntil && gap < 170) {
        event.preventDefault();
        return;
    }
    tailUntil = 0;
    tailDirection = 0;
    if (stepScene(dir))
        event.preventDefault();
}
function setWheel() {
    removeEventListener('wheel', onWheel);
    stopByUser();
    touchpadGesture = false;
    if (home && !reduced.matches && desktopMouse.matches)
        scope.on(window, 'wheel', onWheel, { passive: false });
    geometry = null;
}
setWheel();
scope.on(desktopMouse, 'change', setWheel);
// Resizes (including browser zoom) always invalidate snap positions and restore the
// active wheel mode without forcing a page reload.
scope.on(window, 'resize', setWheel, { passive: true });
scope.on(reduced, 'change', () => { setWheel(); connectObserver(); queueHero(); });
// Native navigation inputs always override the wheel animation.
scope.on(window, 'keydown', stopByUser, { capture: true });
scope.on(window, 'pointerdown', stopByUser, { capture: true, passive: true });
scope.on(window, 'touchstart', stopByUser, { capture: true, passive: true });
scope.on(window, 'pagehide', stopByUser);
scope.on(document, 'visibilitychange', () => { if (document.hidden)
    stopByUser(); });
let resizeTimer = 0;
let ro: ResizeObserver | undefined;
scope.on(window, 'resize', () => { stopByUser(); geometry = null; cancelAnimationFrame(resizeTimer); resizeTimer = requestAnimationFrame(() => { connectObserver(); queueHero(); queueChapterState(); }); }, { passive: true });
if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => { geometry = null; queueHero(); });
    [header, ...sections].forEach(el => { if (el)
        ro?.observe(el); });
}
void document.fonts?.ready.then(() => { if (disposed)
    return; geometry = null; queueChapterState(); });
/* Same-page nav links and logo return smoothly to the top, no reload. */
const currentURL = new URL(location.href);
const normal = (p: string) => p.endsWith('/') ? p + 'index.html' : p;
root.querySelectorAll<HTMLElement>('.site-header a[href], .footer a[href]').forEach(link => {
    const dest = new URL((link as HTMLAnchorElement).href);
    if (dest.protocol !== currentURL.protocol || dest.host !== currentURL.host ||
        normal(dest.pathname) !== normal(currentURL.pathname) || dest.hash || dest.search !== currentURL.search)
        return;
    link.setAttribute('aria-current', 'page');
    scope.on(link, 'click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
            return;
        event.preventDefault();
        $('.mega')?.classList.remove('open');
        $('.mobile-nav')?.classList.remove('open');
        $('#mobile-trigger')?.setAttribute('aria-expanded', 'false');
        animateTo(0, 'top');
    });
});
root.querySelectorAll<HTMLElement>('a[href="#homepage-intro"]').forEach(link => scope.on(link, 'click', event => {
    const target = $('#homepage-intro');
    if (!target)
        return;
    event.preventDefault();
    const stop = sectionStops()[1];
    animateTo(stop?.at ?? target.getBoundingClientRect().top + scrollY - heightOfHeader(), 'hero');
}));
queueHero();

 return () => {
 disposed = true; scope.dispose(); observer?.disconnect(); ro?.disconnect();
 stopMovement(); cancelAnimationFrame(sceneRAF); cancelAnimationFrame(chapterRAF); cancelAnimationFrame(resizeTimer);
 root.classList.remove('cinematic-ready');
 for (const node of actors) {node.classList.remove('cinematic-actor'); delete node.dataset.actorState; delete node.dataset.actorArrival; node.style.removeProperty('--actor-x'); node.style.removeProperty('--actor-delay');}
 };
}
