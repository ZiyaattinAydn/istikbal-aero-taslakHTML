/* İstikbal Aerospace — reversible cinematic scenes and direction-aware reveal.
 * Self-contained, runs over file:// and on any static host; no libraries needed.
 */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const home = document.body.dataset.page === 'home';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMouse = matchMedia('(min-width: 961px) and (hover: hover) and (pointer: fine)');
  const header = $('.site-header');
  const hero = $('.hero-story');
  const stage = $('.hero-stage');
  const sections = [...document.querySelectorAll('main > section'), $('.contact-cta'), $('.footer')].filter(Boolean);
  let travel = null;
  let raf = 0;
  let lastY = scrollY;
  let scrollDirection = 1;
  let lastWheel = -Infinity;
  let tailUntil = 0;
  let tailDirection = 0;
  let touchpadGesture = false;
  let geometry = null;
  let sceneRAF = 0;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const easeQuint = t => t*t*t*(10 + t*(-15 + 6*t));
  const heightOfHeader = () => header?.getBoundingClientRect().height || 82;

  function renderHero() {
    sceneRAF = 0;
    if (!hero || !stage) return;
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
    if (!sceneRAF) sceneRAF = requestAnimationFrame(renderHero);
  }
  addEventListener('scroll', queueHero, {passive:true});
  addEventListener('resize', queueHero, {passive:true});

  /* Individual elements, not whole sections, animate in staggered directions.
     Reset them after leaving either edge so upward visits replay the reveal. */
  const actors = [];
  const seen = new Set();
  function pick(selector, side = 0, baseDelay = 0, step = 85) {
    document.querySelectorAll(selector).forEach((node, i) => {
      if (seen.has(node)) return;
      seen.add(node);
      node.classList.add('cinematic-actor');
      node.style.setProperty('--actor-x', `${side === 0 ? (i%2 ? 26 : -26) : side * 29}px`);
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
  let observer;
  function setReveal(node, state, direction) {
    if (node.dataset.actorState === state) return;
    node.dataset.actorState = state;
    if (state === 'in') node.dataset.actorArrival = direction < 0 ? 'up' : 'down';
  }
  function connectObserver() {
    observer?.disconnect();
    if (reduced.matches || !('IntersectionObserver' in window)) {
      for (const node of actors) node.dataset.actorState = 'in';
      return;
    }
    for (const node of actors) {
      const rect = node.getBoundingClientRect();
      node.dataset.actorState = rect.bottom < heightOfHeader() + 34 ? 'above' : 'below';
    }
    // Flush initial hidden state before moving visible actors to their final pose.
    document.body.classList.add('cinematic-ready');
    observer = new IntersectionObserver(entries => {
      const direction = scrollDirection;
      for (const entry of entries) {
        const node = entry.target;
        if (entry.isIntersecting) setReveal(node, 'in', direction);
        else setReveal(node, entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0) + 2 ? 'above' : 'below', direction);
      }
    }, {rootMargin:`-${heightOfHeader() + 6}px 0px -10% 0px`, threshold:0.04});
    for (const node of actors) observer.observe(node);
  }
  addEventListener('scroll', () => { const next = scrollY; if (Math.abs(next-lastY) > .5) scrollDirection = Math.sign(next-lastY); lastY=next; }, {passive:true});
  connectObserver();

  function sectionStops() {
    if (geometry) return geometry;
    const y = scrollY;
    const bar = heightOfHeader();
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    geometry = [];
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const begin = clamp(Math.round(rect.top + y - bar), 0, maximum);
      const extra = rect.height - (innerHeight - bar);
      geometry.push({section, at:begin, extra});
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
  function animateTo(target, kind='section') {
    stopMovement();
    const from = scrollY;
    target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target));
    if (reduced.matches || Math.abs(target - from) < 2) {
      scrollTo({top:target, behavior:'instant'});
      return;
    }
    const distance = Math.abs(target-from);
    // Hero has a long, intentional crossfade; other section steps remain soft and readable.
    const duration = kind === 'hero' ? 2050 : kind === 'top' ? 1250 : clamp(900 + distance*.17, 1070, 1450);
    const direction = Math.sign(target - from);
    travel = {kind, direction, target};
    const started = performance.now();
    function frame(now) {
      const t = clamp((now-started)/duration, 0, 1);
      const next = from + (target-from)*easeQuint(t);
      scrollTo({top:next,behavior:'instant'});
      if (t < 1) raf = requestAnimationFrame(frame);
      else {
        scrollTo({top:target,behavior:'instant'});
        stopMovement();
        tailDirection = direction;
        tailUntil = now + 300;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function smoothWheel(delta) {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (travel?.kind === 'free') {
      travel.target = clamp(travel.target + delta*1.18, 0, max);
      return;
    }
    stopMovement();
    const s = {kind:'free', target:clamp(scrollY+delta*1.18,0,max), position:scrollY};
    travel = s;
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(60,now-last); last=now;
      s.position += (s.target - s.position)*(1-Math.exp(-dt/92));
      scrollTo({top:s.position,behavior:'instant'});
      if (Math.abs(s.position-s.target)>.6) raf=requestAnimationFrame(frame);
      else {scrollTo({top:s.target,behavior:'instant'});stopMovement();}
    }
    raf = requestAnimationFrame(frame);
  }
  function stepScene(dir) {
    const stops = sectionStops();
    if (!stops.length) return false;
    const y = scrollY;
    let index = 0;
    for (let i=0; i<stops.length; i++) if (stops[i].at <= y + 8) index = i;
    const current = stops[index];
    // Exception: very tall sections should keep their bottom content readable.
    // These additional stops are only used if the section exceeds a viewport by >~160px.
    if (dir > 0) {
      if (index !== 0 && current.extra > 160) {
        const end = current.at + current.extra;
        if (y < end - 15) {
          animateTo(Math.min(end, y + innerHeight*.84), 'section');
          return true;
        }
      }
      const next = stops.find(x => x.at > y + 18);
      if (!next) return false;
      animateTo(next.at, index===0 ? 'hero':'section');
      return true;
    }
    if (y > current.at+18) {
      animateTo(current.at, 'section');
      return true;
    }
    for (let i=index-1;i>=0;i--) {
      const prev=stops[i];
      if (prev.at < y - 18) {
        const trailing = i !== 0 && prev.extra > 160 ? Math.max(prev.at,prev.at+prev.extra) : prev.at;
        animateTo(trailing, i===0 ? 'hero':'section');
        return true;
      }
    }
    return false;
  }

  function onWheel(event) {
    if (!event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        event.target.closest('input, textarea, select, [contenteditable], [data-native-scroll], .mega.open, .mobile-nav.open') ||
        $('.mega.open, .mobile-nav.open')) return;
    const now = performance.now();
    const gap = now - lastWheel;
    lastWheel = now;
    if (gap > 210) touchpadGesture = false;
    const delta = event.deltaY * (event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    const dir = Math.sign(delta);
    if (!dir) return;
    if (event.deltaMode===0 && (Math.abs(delta)<48 || Math.abs(event.deltaX)>2 || !Number.isInteger(delta))) touchpadGesture=true;
    if (touchpadGesture) {
      // Touchpads retain native momentum, and do not get forced through wheel steps.
      stopMovement();
      return;
    }
    if (travel?.kind !== 'free' && travel) {
      event.preventDefault();
      if (travel.direction===dir) return;
      stopMovement();
    }
    if (dir===tailDirection && now<tailUntil && gap<170) {event.preventDefault();return;}
    tailUntil=0;
    tailDirection=0;
    if (home) {
      if (stepScene(dir)) event.preventDefault();
    } else {
      const max=document.documentElement.scrollHeight-innerHeight;
      if ((dir>0&&scrollY>=max-1) || (dir<0&&scrollY<=1)) return;
      event.preventDefault();
      smoothWheel(delta);
    }
  }
  function setWheel() {
    removeEventListener('wheel', onWheel);
    stopByUser();
    touchpadGesture=false;
    if (!reduced.matches && desktopMouse.matches) addEventListener('wheel',onWheel,{passive:false});
    geometry=null;
  }
  setWheel();
  desktopMouse.addEventListener('change',setWheel);
  reduced.addEventListener('change',()=>{setWheel();connectObserver();queueHero();});
  // Native navigation inputs always override the wheel animation.
  addEventListener('keydown',stopByUser,{capture:true});
  addEventListener('pointerdown',stopByUser,{capture:true,passive:true});
  addEventListener('touchstart',stopByUser,{capture:true,passive:true});
  addEventListener('pagehide',stopByUser);
  document.addEventListener('visibilitychange',()=>{if(document.hidden) stopByUser();});
  let resizeTimer;
  addEventListener('resize',()=>{stopByUser();geometry=null;cancelAnimationFrame(resizeTimer);resizeTimer=requestAnimationFrame(()=>{connectObserver();queueHero();});},{passive:true});
  if ('ResizeObserver' in window) {
    const ro=new ResizeObserver(()=>{geometry=null;queueHero();});
    [header,...sections].filter(Boolean).forEach(el=>ro.observe(el));
  }
  document.fonts?.ready.then(()=>geometry=null);

  /* Same-page nav links and logo return smoothly to the top, no reload. */
  const currentURL = new URL(location.href);
  const normal = p => p.endsWith('/') ? p+'index.html':p;
  document.querySelectorAll('.site-header a[href], .footer a[href], .contact-cta a[href]').forEach(link=>{
    const dest = new URL(link.href);
    if (dest.protocol!==currentURL.protocol || dest.host!==currentURL.host ||
        normal(dest.pathname)!==normal(currentURL.pathname) || dest.hash || dest.search!==currentURL.search) return;
    link.setAttribute('aria-current','page');
    link.addEventListener('click',event=>{
      if (event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      $('.mega')?.classList.remove('open');
      $('.mobile-nav')?.classList.remove('open');
      $('#mobile-trigger')?.setAttribute('aria-expanded','false');
      animateTo(0,'top');
    });
  });
  document.querySelectorAll('a[href="#homepage-intro"]').forEach(link=>link.addEventListener('click',event=>{
    const target=$('#homepage-intro');
    if (!target) return;
    event.preventDefault();
    const stop=sectionStops()[1];
    animateTo(stop?.at ?? target.getBoundingClientRect().top+scrollY-heightOfHeader(),'hero');
  }));
  queueHero();
})();
