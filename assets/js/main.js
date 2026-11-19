(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (reduced || !window.gsap) root.classList.add('reduced');

  /* nav: mobile sheet */
  const nav = document.getElementById('nav');
  const burger = nav.querySelector('.nav__burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('.nav__sheet a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));

  /* hero rotating word */
  const words = [...document.querySelectorAll('.rotator__word')];
  const rot = document.querySelector('.rotator');
  let wi = 0;
  const fit = () => { rot.style.width = words[wi].scrollWidth + 'px'; };
  document.fonts.ready.then(fit); window.addEventListener('resize', fit);
  if (!reduced) setInterval(() => {
    const cur = words[wi];
    cur.classList.remove('is-on'); cur.classList.add('is-out');
    setTimeout(() => cur.classList.remove('is-out'), 900);
    wi = (wi + 1) % words.length;
    words[wi].classList.add('is-on');
    fit();
    rot.setAttribute('aria-label', words[wi].textContent);
  }, 2400);

  /* industries rail: buttons + drag */
  const rail = document.getElementById('rail');
  document.querySelectorAll('.industries__nav .round').forEach(b => b.addEventListener('click', () => {
    const card = rail.querySelector('.card');
    rail.scrollBy({ left: (card.offsetWidth + 20) * +b.dataset.dir, behavior: 'smooth' });
  }));
  let down = false, sx = 0, sl = 0, moved = false;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
  window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-drag'); } rail.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', () => { if (!down) return; down = false; rail.classList.remove('is-drag'); });

  /* FAQ: one open at a time */
  const qas = [...document.querySelectorAll('.qa')];
  qas.forEach(q => q.addEventListener('toggle', () => { if (q.open) qas.forEach(o => o !== q && (o.open = false)); }));

  /* make sure the film plays (Chrome/Firefox autoplay) */
  const vid = document.querySelector('.film__video');
  const tryPlay = () => vid && vid.play().catch(() => {});
  tryPlay();

  if (reduced || !window.gsap) {
    document.querySelectorAll('.film__line').forEach(l => (l.style.opacity = 1));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === '#top' ? 0 : -72 });
    }));
  }

  /* hero intro */
  gsap.from('.hero__line', { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .12, delay: .1 });
  gsap.from(['.hero__sub', '.hero__cta'], { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .45 });
  gsap.from('.hero__frame img', { scale: 1.08, opacity: 0, duration: 1.8, ease: 'expo.out', delay: .5 });

  /* hero frame: inset rounded card grows to full bleed */
  gsap.fromTo('[data-hero-frame]',
    { clipPath: 'inset(0% 7% 0% 7% round 36px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.hero__stage', start: 'top 85%', end: 'top 10%', scrub: true } });

  /* film: video zooms out, lines light up one by one */
  const lines = gsap.utils.toArray('.film__line');
  const filmTl = gsap.timeline({ scrollTrigger: { trigger: '.film', start: 'top top', end: 'bottom bottom', scrub: .6, onEnter: tryPlay } });
  filmTl.to('.film__video', { scale: 1, ease: 'none', duration: lines.length + 1 }, 0);
  lines.forEach((l, i) => filmTl.to(l, { opacity: 1, duration: .6, ease: 'none' }, i + .3));

  /* generic reveals */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* highlights: pinned horizontal gallery */
  const hl = document.getElementById('hl'), track = document.getElementById('hlTrack');
  const cards = [...track.children], pills = [...hl.querySelectorAll('.hl__pills button')];
  const setActive = i => {
    cards.forEach((c, k) => c.classList.toggle('is-on', k === i));
    pills.forEach((p, k) => { p.classList.toggle('is-on', k === i); p.setAttribute('aria-selected', k === i); });
  };
  setActive(0);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1001px)', () => {
    const dist = () => track.scrollWidth - innerWidth;
    const st = gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: hl, start: 'top 72px', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true,
        onUpdate: self => {
          const i = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
          setActive(i);
        } } }).scrollTrigger;
    const go = i => {
      const y = st.start + (st.end - st.start) * (i / (cards.length - 1));
      window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: 'smooth' });
    };
    pills.forEach((p, i) => p.onclick = () => go(i));
  });
  mm.add('(max-width: 1000px)', () => {
    const onScroll = () => {
      const w = cards[0].offsetWidth + 16;
      setActive(Math.min(cards.length - 1, Math.round(track.scrollLeft / w)));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    pills.forEach((p, i) => p.onclick = () => track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' }));
    return () => track.removeEventListener('scroll', onScroll);
  });

  /* parallax inside frames */
  gsap.utils.toArray('[data-parallax] img').forEach(img => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* spec counters */
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), o = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => (el.textContent = o.v.toFixed(dec)) });
  });

  /* CTA background drift */
  gsap.fromTo('.cta__bg', { scale: 1.18 }, { scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
