/* =============================================
   ENERGY CONSERVATION
   CINEMATIC SCROLL ENGINE — GSAP 3.12.5 + ScrollTrigger + Lenis
   ============================================= */

/* ── SELECTOR GUIDE (adjust if you rename elements) ──
   Stage container  : #sxStage          (.sx-stage)
   Hero visual      : .sx-visual-frame
   Giant outline    : .sx-giant-outline
   Headline layer   : .sx-layer-headline
   Headline lines   : .sx-headline .sx-line-inner
   Band / certs     : .sx-layer-band
   Scroll hint      : .sx-scroll-hint
   BG layer         : .sx-layer-bg
   Scrim            : .sx-layer-scrim
   Support text     : .sx-support-text
   Info block       : .sx-info-block
   Statement        : .sx-statement-wrap, statement mask lines
   Panel            : #sxPanel
   Panel cols       : .sx-panel-col
   Horiz track      : #sxHorizTrack
   Horiz closing    : .sx-horiz-closing
   Progress counter : #sxCounterVal
   Rail thumb       : #sxRailThumb
   Rail chapters    : .sx-rail-ch
   ── Durations (scroll space) ──
   Main stage pin height: 700vh  → adjust PIN_SCREENS below
   Horiz scroll distance: auto-measured from track.scrollWidth
   ─────────────────────────────────────────────── */

const PIN_SCREENS = 3.6; // Snappy 360svh pinned space for hero stage (eliminates long empty gaps)

/* ════════════════════════════════════════════════
   0. MEDIA & REDUCED MOTION DETECTION
   ════════════════════════════════════════════════ */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth <= 768;

/* ════════════════════════════════════════════════
   1. LENIS SMOOTH SCROLL (synced to ScrollTrigger)
   ════════════════════════════════════════════════ */
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;
  lenis = new Lenis({
    duration: prefersReduced ? 0 : 0.7,      // ↓ dari 1.2 — terasa lebih responsif
    easing: (t) => 1 - Math.pow(1 - t, 3),  // ease-out cubic, lebih natural
    smoothWheel: !prefersReduced,
    wheelMultiplier: 1,                       // default, tidak mempercepat artificial
    touchMultiplier: 1.5,
  });

  // Sync Lenis RAF dengan GSAP ticker
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ════════════════════════════════════════════════
   2. GSAP + SCROLLTRIGGER REGISTRATION
   ════════════════════════════════════════════════ */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ════════════════════════════════════════════════
   3. STAGE HEIGHT SETUP
   ════════════════════════════════════════════════ */
function setStageHeight() {
  const container = document.querySelector('.sx-stage-container');
  if (!container) return;
  container.style.height = (PIN_SCREENS * 100) + 'svh';
}

/* ════════════════════════════════════════════════
   4. CINEMATIC MASTER TIMELINE (scrub: 1)
   ════════════════════════════════════════════════ */
function buildMasterTimeline() {
  const stage           = document.getElementById('sxStage');
  if (!stage) return;

  const visual          = document.querySelector('.sx-typo-visual');
  const bgLayer         = document.querySelector('.sx-layer-bg');
  const outline         = document.querySelector('.sx-giant-outline');
  const headlineLayer   = document.querySelector('.sx-layer-headline');
  const headlineLines   = []; // sx-headline hidden; typo-visual (layer 4) serves as headline
  const band            = document.querySelector('.sx-layer-band');
  const scrollHint      = document.querySelector('.sx-scroll-hint');
  const scrim           = document.querySelector('.sx-layer-scrim');
  const supportText     = document.querySelector('.sx-support-text');
  const infoBlock       = document.querySelector('.sx-info-block');
  const statementWrap   = document.querySelector('.sx-statement-wrap');
  const statementLines  = gsap.utils.toArray('.sx-statement-wrap .sx-line-inner');
  const panel           = document.getElementById('sxPanel');
  const panelCols       = gsap.utils.toArray('.sx-panel-col');

  /* ─ INTRO: before scroll (onload) ─ */
  const introTL = gsap.timeline();

  // Typo visual elements
  const tvSolid  = document.querySelector('.sx-tv-solid');
  const tvOutline = document.querySelector('.sx-tv-outline');
  const tvEbar    = document.querySelector('.sx-tv-ebar');

  if (!prefersReduced) {
    // Eyebrow fade
    introTL.from('.sx-eyebrow', { opacity: 0, y: 14, duration: 0.7, ease: 'power4.out' }, 0.1);
    introTL.from('.sx-tv-eyebrow', { opacity: 0, y: 10, duration: 0.6, ease: 'power3.out' }, 0.05);

    // Headline lines unmask: yPercent 115 → 0, stagger 0.14
    if (headlineLines.length) {
      introTL.from(headlineLines, {
        yPercent: 115,
        duration: 0.95,
        ease: 'power4.out',
        stagger: 0.14
      }, 0.2);
    }

    // ENERGY word: slide up + glow
    if (tvSolid) {
      introTL.from(tvSolid, {
        yPercent: 80,
        opacity: 0,
        duration: 1.0,
        ease: 'power4.out'
      }, 0.3);
    }
    // CONSERVATION outline: slide up slightly later
    if (tvOutline) {
      introTL.from(tvOutline, {
        yPercent: 80,
        opacity: 0,
        duration: 1.0,
        ease: 'power4.out'
      }, 0.45);
    }
    // Energy bar grows from 0
    if (tvEbar) {
      introTL.from('.sx-tv-ebar-fill', { scaleX: 0, transformOrigin: 'left', duration: 1.0, ease: 'power2.out' }, 0.75);
    }

    // Band slides up
    if (band) {
      introTL.from(band, { yPercent: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.75);
    }
  } else {
    // Reduced motion: snap visible
    gsap.set(['.sx-eyebrow', headlineLines, tvSolid, tvOutline, band], { clearProps: 'all' });
  }

  /* ─ MASTER SCROLL TIMELINE (10 units / scrub:1) ─ */
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.sx-stage-container',
      start: 'top top',
      end: () => '+=' + (PIN_SCREENS * window.innerHeight),
      scrub: prefersReduced ? true : 0.4,   // ↓ dari 1 — jauh lebih responsif
      anticipatePin: 1,
      pin: stage,
      pinSpacing: false,
      invalidateOnRefresh: true,
      fastScrollEnd: true,                  // snap ke end saat fast scroll
    }
  });

  const isLandscape = !isMobile();

  /* ══════════════════════════════════════════════
     ADEGAN 01 → 02 (t 0–2)
     Headline naik + fade. Visual scale up.
     Band keluar. BG scale (parallax). Support masuk.
     ══════════════════════════════════════════════ */

  // Scroll hint fade out
  if (scrollHint) tl.to(scrollHint, { opacity: 0, duration: 0.3 }, 0);

  // Headline naik (yPercent -30) + opacity 0.25
  tl.to(headlineLayer, { yPercent: -30, opacity: 0.25, ease: 'none', duration: 2 }, 0);

  // Typo visual: subtle scale + drift (parallax feel)
  if (visual) tl.to(visual, { scale: 1.05, y: '-4vh', ease: 'none', duration: 2 }, 0);

  // Foreground band turun keluar
  if (band) tl.to(band, { yPercent: 100, ease: 'none', duration: 1.2 }, 0);

  // BG layer parallax (durasi panjang untuk efek slow drift)
  if (bgLayer) tl.to(bgLayer, { scale: 1.3, ease: 'none', duration: 5 }, 0);

  // Outline teks horizontal
  if (outline) tl.to(outline, { xPercent: 3, ease: 'none', duration: 5 }, 0);

  // Support text masuk di t=0.8
  if (supportText) {
    tl.to(supportText, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.6 }, 0.8);
  }

  /* ══════════════════════════════════════════════
     ADEGAN 03 (t 2–4)
     Support keluar. Headline naik lagi + hilang.
     Visual bergeser kanan + scale 1.9.
     Outline lanjut lambat (×0.4). Info block masuk (×1).
     Accent foreground cepat (×1.6).
     ══════════════════════════════════════════════ */

  // Support teks keluar
  if (supportText) {
    tl.to(supportText, { y: -40, opacity: 0, ease: 'power2.in', duration: 0.5 }, 2);
  }

  // Headline naik lagi (yPercent -90) + hilang total
  tl.to(headlineLayer, { yPercent: -90, opacity: 0, ease: 'none', duration: 1.5 }, 2.2);

  // Typo visual: drift kanan (desktop) / atas (mobile)
  if (visual) {
    if (isLandscape) {
      // Desktop: geser ke kanan sehingga teks tidak tumpuk dengan info block kiri
      tl.to(visual, { x: '22vw', scale: 1.05, ease: 'power1.inOut', duration: 2 }, 2);
    } else {
      // Mobile: geser ke atas
      tl.to(visual, { y: '-18vh', scale: 1.02, ease: 'power1.inOut', duration: 2 }, 2);
    }
  }

  // Outline: xPercent 6 → -12, opacity sampai 0.22 (kecepatan ×0.4)
  if (outline) {
    tl.to(outline, { xPercent: -12, opacity: 0.22, ease: 'none', duration: 3.2 }, 2);
  }

  // Info block masuk dari kiri (x -50→0), kecepatan ×1
  if (infoBlock) {
    tl.to(infoBlock, { x: 0, opacity: 1, ease: 'power2.out', duration: 1.4 }, 2.3);
    gsap.set(infoBlock, { x: -50 });
  }


  /* ══════════════════════════════════════════════
     ADEGAN 04 (t 4–6)
     Info keluar. Visual ke tengah + scale ~7.5 (fullscreen).
     BG dan foreground fade. Scrim opacity 1.
     Statement besar muncul per baris.
     ══════════════════════════════════════════════ */

  // Info block keluar
  if (infoBlock) {
    tl.to(infoBlock, { x: -60, opacity: 0, ease: 'power2.in', duration: 0.6 }, 4);
  }

  // Outline hilang
  if (outline) tl.to(outline, { opacity: 0, duration: 0.8 }, 4);

  // Adegan 04: Typo visual menyusut + fade ke tengah (scrim menutupinya)
  if (visual) {
    tl.to(visual, {
      x: 0, y: 0,
      scale: 0.85,
      opacity: 0,
      ease: 'power1.inOut',
      duration: 1.5
    }, 4);
  }

  // BG layer fade
  if (bgLayer) tl.to(bgLayer, { opacity: 0, duration: 1 }, 4.2);

  // Scrim naik opacity 1
  if (scrim) tl.to(scrim, { opacity: 0.88, ease: 'power1.inOut', duration: 1.5 }, 4.3);

  // Statement wrap visible
  if (statementWrap) {
    tl.to(statementWrap, { opacity: 1, duration: 0.5 }, 4.8);
  }

  // Statement lines reveal dari mask (yPercent 115→0), stagger 0.2
  if (statementLines.length) {
    gsap.set(statementLines, { yPercent: 115 });
    tl.to(statementLines, {
      yPercent: 0,
      ease: 'power2.out',
      stagger: 0.2,
      duration: 0.8
    }, 5.0);
  }

  /* ══════════════════════════════════════════════
     ADEGAN 05 (t 6–8)
     Statement keluar per baris ke atas.
     Visual naik (-12vh) kecepatan berbeda.
     Panel naik dari bawah. Kolom masuk stagger.
     ══════════════════════════════════════════════ */

  // Statement lines keluar ke atas
  if (statementLines.length) {
    tl.to(statementLines, {
      yPercent: -115,
      ease: 'power2.in',
      stagger: 0.12,
      duration: 0.6
    }, 6.0);
  }
  if (statementWrap) tl.to(statementWrap, { opacity: 0, duration: 0.4 }, 6.5);

  // Visual bergeser ke atas -12vh (lebih lambat dari teks)
  if (visual) {
    tl.to(visual, { y: '-12vh', ease: 'none', duration: 2 }, 6.0);
  }

  // Panel naik: yPercent 100 → 0
  if (panel) {
    tl.to(panel, {
      yPercent: 0,
      ease: 'power2.inOut',
      duration: 1.5
    }, 6.3);
  }

  // Panel columns masuk stagger, offset vertikal 0/7vh/14vh dari CSS
  if (panelCols.length) {
    tl.to(panelCols, {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      stagger: 0.25,
      duration: 0.8
    }, 7.0);
    gsap.set(panelCols, { y: 30 });
  }

  /* ══════════════════════════════════════════════
     ADEGAN 06 (t 8–10)
     Panel warna berubah ke background section berikutnya.
     border-radius → 0. Konten geser kiri.
     Panel "menyatu" dengan section berikutnya.
     ══════════════════════════════════════════════ */

  if (panel) {
    tl.to(panel, {
      borderRadius: 0,
      ease: 'power1.inOut',
      duration: 1.5
    }, 8);
  }

  // Geser konten panel sedikit ke kiri
  const panelInner = document.querySelector('.sx-panel-inner');
  if (panelInner) {
    tl.to(panelInner, { x: '-2vw', ease: 'none', duration: 2 }, 8);
  }

  // Scrim fade out (panel sudah cover)
  if (scrim) tl.to(scrim, { opacity: 0, duration: 1 }, 8.5);
}

/* ════════════════════════════════════════════════
   5. INTERACTIVE SPLIT STEPPER (CHAPTER 3)
   ════════════════════════════════════════════════ */
function initOpsSectionAnimations() {
  const accordion = document.getElementById('scopeAccordion');
  if (!accordion) return;

  const items = Array.from(accordion.querySelectorAll('.scope-acc'));
  if (!items.length) return;

  function openItem(idx, { scroll = false } = {}) {
    items.forEach((item, i) => {
      const isOpen = i === idx;
      item.classList.toggle('is-open', isOpen);
      const head = item.querySelector('.scope-acc-head');
      const panel = item.querySelector('.scope-acc-panel');
      if (head) head.setAttribute('aria-expanded', String(isOpen));
      if (panel) panel.setAttribute('aria-hidden', String(!isOpen));
    });

    if (scroll) {
      const target = items[idx];
      if (lenis) lenis.scrollTo(target, { offset: -120, duration: 0.9 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Collapsed rows are interactive
  items.forEach((item, idx) => {
    const head = item.querySelector('.scope-acc-head');
    if (head) {
      head.addEventListener('click', () => openItem(idx, { scroll: !item.classList.contains('is-open') }));
    }
  });

  // Scroll-driven accordion: whichever row crosses the focal band opens
  if (typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
    items.forEach((item, idx) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 72%',
        end: 'bottom 28%',
        onEnter: () => openItem(idx),
        onEnterBack: () => openItem(idx),
      });
    });
  }

  // Scroll reveal for the new head block
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.fromTo('.sx-ops-head',
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '.sx-ops-head', start: 'top 82%', toggleActions: 'play none none reverse' }
      }
    );
    gsap.fromTo(items,
      { opacity: 0, y: 26 },
      {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: accordion, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  }
}

/* ════════════════════════════════════════════════
   6. FIXED UI: Scroll Counter & Global Indicators
   ════════════════════════════════════════════════ */
function initScrollUI() {
  const counterVal = document.getElementById('sxCounterVal');
  const progressBar = document.getElementById('scrollProgress');

  function onScroll() {
    const scrollY    = window.scrollY;
    const totalH     = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = totalH > 0 ? scrollY / totalH : 0;
    const pct        = Math.round(progress * 100);

    // Counter (bottom corner)
    if (counterVal) counterVal.textContent = String(pct).padStart(2, '0');

    // Progress bar (top)
    if (progressBar) progressBar.style.width = pct + '%';

    // Floating nav visibility (smoothly fade in once scrolled past top hero)
    const floatingNav = document.getElementById('floatingNav');
    if (floatingNav) {
      floatingNav.classList.toggle('visible', scrollY > 180);
    }

    // Active floating nav dot
    updateActiveChapter(scrollY);

    // Timeline line progress fallback
    updateTimelineProgress();
  }

  // Listen on both native scroll and lenis
  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll(); // init
}

/* ════════════════════════════════════════════════
   7. ORIGINAL FUNCTIONALITY (preserved intact)
   ════════════════════════════════════════════════ */

/* Active chapter detection for floating nav */
const chapters = [
  { id: 'ch-hero',    dot: null },
  { id: 'ch-opening', dot: null },
  { id: 'ch-carbon',  dot: null },
  { id: 'ch-pillars', dot: null },
  { id: 'ch-journey', dot: null },
  { id: 'ch-gallery', dot: null },
  { id: 'ch-numbers', dot: null },
  { id: 'ch-visi',    dot: null },
];

function initChapterDots() {
  chapters.forEach(ch => {
    ch.dot = document.querySelector(`.fnav-dot[data-target="${ch.id}"]`);
  });
}

function updateActiveChapter(scrollY) {
  const navDots = document.querySelectorAll('.fnav-dot');
  const stage = document.querySelector('.sx-stage-container');
  const stageHeight = stage ? stage.offsetHeight : window.innerHeight * 7;

  let currentActive = 'ch-hero';
  if (scrollY < stageHeight * 0.35) {
    currentActive = 'ch-hero';
  } else if (scrollY < stageHeight * 0.95) {
    currentActive = 'ch-opening';
  } else {
    const lowerSectionIds = ['ch-carbon', 'ch-pillars', 'ch-journey', 'ch-gallery', 'ch-numbers', 'ch-visi'];
    for (const id of lowerSectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.15) {
          currentActive = id;
          break;
        }
      }
    }
  }

  navDots.forEach(dot => {
    dot.classList.toggle('active', dot.getAttribute('data-target') === currentActive);
  });
}

/* Timeline progress line */
function updateTimelineProgress() {
  const timelineContainer = document.getElementById('timelineContainer');
  const timelineProgress  = document.getElementById('timelineProgress');
  const timelineItems     = document.querySelectorAll('.tl-item');
  if (!timelineContainer || !timelineProgress) return;

  const rect       = timelineContainer.getBoundingClientRect();
  const windowH    = window.innerHeight;
  const startOff   = windowH * 0.6;
  const progressPx = Math.max(0, startOff - rect.top);
  const percent    = Math.min(100, (progressPx / rect.height) * 100);
  timelineProgress.style.height = percent + '%';

  timelineItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    item.classList.toggle('tl-active', itemRect.top < windowH * 0.65);
  });
}

/* Scroll reveal (IntersectionObserver) for jo-items */
function initScrollReveal() {
  const journeyItems = document.querySelectorAll('.jo-item');
  const revealObs    = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        if (delay > 0) {
          setTimeout(() => el.classList.add('in'), delay);
        } else {
          el.classList.add('in');
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  journeyItems.forEach(item => revealObs.observe(item));
}

/* Spotlight cursor effect */
function initSpotlight() {
  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  });
}

/* Number counter animation */
function initCounters() {
  let animated = false;
  const section = document.getElementById('ch-numbers');
  if (!section) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        document.querySelectorAll('.num-value').forEach(el => {
          const target   = parseFloat(el.getAttribute('data-target') || '0');
          const suffix   = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const sep      = el.getAttribute('data-sep') || '.';
          const duration = 1600;
          const start    = performance.now();
          // Number and unit are separate spans so the unit can be styled smaller.
          const numEl = el.querySelector('.nv-num');
          const suffixEl = el.querySelector('.nv-suffix');
          if (suffixEl) suffixEl.textContent = suffix;
          const fmt = (v) => {
            const fixed = decimals > 0 ? v.toFixed(decimals) : String(Math.floor(v));
            const [intPart, decPart] = fixed.split('.');
            const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
            return grouped + (decPart ? sep + decPart : '');
          };
          const paint = (v) => {
            if (numEl) numEl.textContent = fmt(v);
            else el.textContent = fmt(v) + suffix;
          };
          function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease     = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            paint(target * ease);
            if (progress < 1) requestAnimationFrame(step);
            else paint(target);
          }
          requestAnimationFrame(step);
        });
        document.querySelectorAll('.num-fill').forEach(bar => {
          bar.style.width = (bar.getAttribute('data-w') || '100') + '%';
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  obs.observe(section);
}

/* Gallery filter — FLIP reflow.
   Cards that leave fade out where they stand, the grid re-measures, then the
   survivors settle into their new slots while the new cards fade in.

   Two details make the transition read as one continuous motion instead of a
   series of snaps:

   - The new layout is measured up front (a dry run that is reverted before the
     browser paints), so every distance is known before the timeline is built.
     Deciding inside a callback meant the tweens could not see the geometry.
   - Cards that would travel a long way across the grid crossfade in place
     instead of gliding. A 800px diagonal flight at animation speed reads as a
     card being flung across the page, which is what looked broken. */
let galleryRevealTween = null;

function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gfilter-btn');
  const grid = document.getElementById('galleryGrid');
  const cards = Array.from(document.querySelectorAll('.gallery-card'));
  if (!filterBtns.length || !cards.length) return;

  const canAnimate = typeof gsap !== 'undefined' && !prefersReduced;

  const OUT = 0.2;          // fade-out duration
  const SWAP = OUT + 0.02;  // layout swap happens here
  const MOVE = 0.52;        // settle duration
  const FADE_IN = 0.46;     // arrival duration
  // Beyond this distance (px) a card crossfades in its new slot rather than
  // travelling there. Roughly one card-height — anything longer looks flung.
  const GLIDE_MAX = 320;

  let activeFilter = 'all';
  let running = null;

  const isShown = card => card.style.display !== 'none';
  const matches = (card, filter) =>
    filter === 'all' || card.getAttribute('data-category') === filter;

  function setDisplay(filter) {
    cards.forEach(card => {
      card.style.display = matches(card, filter) ? 'flex' : 'none';
    });
  }

  function measure() {
    const map = new Map();
    cards.forEach(card => {
      if (isShown(card)) map.set(card, card.getBoundingClientRect());
    });
    return map;
  }

  function resetCards() {
    cards.forEach(card => gsap.set(card, { clearProps: 'opacity,transform' }));
  }

  function switchTo(filter) {
    if (filter === activeFilter) return;
    const previousFilter = activeFilter;
    activeFilter = filter;

    if (!canAnimate) {
      if (galleryRevealTween) {
        galleryRevealTween.kill();
        galleryRevealTween = null;
        cards.forEach(card => card.style.opacity = '');
      }
      setDisplay(filter);
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      return;
    }

    if (running) running.kill();
    // The entrance reveal may still be running if the user clicks a filter
    // quickly; hand its cards over cleanly before animating them ourselves.
    if (galleryRevealTween) {
      galleryRevealTween.kill();
      galleryRevealTween = null;
    }
    // A killed timeline can leave cards pinned mid-fade; start from a clean slate.
    resetCards();

    const before = measure();
    const oldHeight = grid ? grid.offsetHeight : 0;

    // Dry run: apply the new layout, measure it, then put the old one back —
    // all before the browser gets a chance to paint, so nothing flickers.
    setDisplay(filter);
    const after = measure();
    const newHeight = grid ? grid.offsetHeight : 0;
    setDisplay(previousFilter);

    const leaving  = cards.filter(c => before.has(c) && !after.has(c));
    const arriving = cards.filter(c => !before.has(c) && after.has(c));
    const staying  = cards.filter(c => before.has(c) && after.has(c));

    // Split survivors by travel distance. Short hops slide to their new slot;
    // long haulers would have to cross the whole grid, so they are re-entered
    // exactly like a card that was not on screen before.
    const gliding = [];
    const reEntering = [];
    staying.forEach(card => {
      const b = before.get(card);
      const a = after.get(card);
      const dx = Math.round(b.left - a.left);
      const dy = Math.round(b.top - a.top);
      if (dx === 0 && dy === 0) return;
      if (Math.hypot(dx, dy) > GLIDE_MAX) reEntering.push(card);
      else gliding.push([card, dx, dy]);
    });

    // Everything that does not slide away has to be invisible *before* the swap,
    // otherwise the layout jump is visible for a frame.
    const entering = cards.filter(c => arriving.includes(c) || reEntering.includes(c));
    const swapAt = (leaving.length || reEntering.length) ? SWAP : 0;
    const fadingOut = leaving.concat(reEntering);

    const tl = gsap.timeline();
    running = tl;

    // 1. Outgoing cards fade out where they stand.
    if (fadingOut.length) {
      tl.to(fadingOut, {
        opacity: 0,
        scale: 0.96,
        duration: OUT,
        ease: 'power2.in',
        stagger: 0.012
      }, 0);
    }

    // 2. Swap in the new layout, pin survivors where they used to be.
    //    The height is set here, in the same frame as the display change, so the
    //    section never gets a frame at its new size before the tween starts.
    tl.add(() => {
      setDisplay(filter);
      gliding.forEach(([card, dx, dy]) => gsap.set(card, { x: dx, y: dy }));
      if (entering.length) gsap.set(entering, { opacity: 0, scale: 0.97 });
      if (grid && Math.abs(newHeight - oldHeight) > 1) gsap.set(grid, { height: oldHeight });
    }, swapAt);

    // 3. The section box eases to its new height alongside the cards.
    if (grid && Math.abs(newHeight - oldHeight) > 1) {
      tl.to(grid, {
        height: newHeight,
        duration: MOVE,
        ease: 'power2.inOut',
        onComplete: () => { grid.style.height = ''; }
      }, swapAt);
    }

    // 4. Survivors settle: short hops slide, long hops fade in their new slot.
    if (gliding.length) {
      tl.to(gliding.map(g => g[0]), {
        x: 0,
        y: 0,
        duration: MOVE,
        ease: 'power3.out',
        stagger: 0.02,
        clearProps: 'transform'
      }, swapAt);
    }

    // 5. New cards — and survivors that re-enter from a far slot — fade in.
    if (entering.length) {
      tl.to(entering, {
        opacity: 1,
        scale: 1,
        duration: FADE_IN,
        ease: 'power2.out',
        stagger: 0.04,
        clearProps: 'opacity,transform'
      }, swapAt + 0.06);
    }

    // Bound to both events so an interrupted switch still leaves the grid
    // unmeasured and the cards free of inline transforms.
    const finish = () => {
      resetCards();
      if (grid) grid.style.height = '';
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      if (running === tl) running = null;
    };
    tl.eventCallback('onComplete', finish);
    tl.eventCallback('onInterrupt', finish);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchTo(btn.getAttribute('data-filter'));
    });
  });
}

/* Lightbox — Enhanced with Navigation, Slide Counter, & Structured Narasi */
const GALLERY_ITEMS_DATA = [
  {
    title: "Green Energy Partnership Forum",
    badge: "Plakat • PLN Indonesia",
    badgeClass: "badge-gold",
    img: "assets/plakat/Green%20Energy%20Partnership%20by%20PLN.jpg",
    alt: "Plakat Green Energy Partnership Forum",
    summary: "Plakat apresiasi resmi dari PLN Energy Management Indonesia kepada PT Pratama Abadi Industri sebagai mitra aktif dalam percepatan transisi energi hijau — &ldquo;Thank you for being our partner in the energy transition&rdquo;.",
    points: [
      "Bentuk plakat apresiasi atas inisiatif dekarbonisasi industri manufaktur berkelanjutan.",
      "Penguatan kemitraan strategis dalam pemanfaatan energi bersih bersama PLN."
    ]
  },
  {
    title: "Plakat Renewable Energy Certificate (REC) PLN",
    badge: "Plakat • PT PLN (Persero)",
    badgeClass: "badge-green",
    img: "assets/plakat/REC%20by%20PLN.jpeg",
    alt: "Plakat Renewable Energy Certificate dari PLN",
    summary: "Plakat Renewable Energy Certificate (REC) yang diterima PT Pratama Abadi Garut dari PT PLN (Persero) sebagai bukti resmi penggunaan pasokan listrik dari sumber energi terbarukan.",
    points: [
      "Penyerahan plakat dan verifikasi resmi atas pasokan daya listrik operasional berbasis Energi Baru Terbarukan (EBT).",
      "Menurunkan jejak emisi karbon Scope 2 secara signifikan dan terdata transparan."
    ]
  },
  {
    title: "Sertifikat ISO 50001:2018",
    badge: "Sertifikat • ISO 50001:2018",
    badgeClass: "",
    img: "assets/sertifikat/iso%2050001.png",
    alt: "Sertifikat ISO 50001:2018",
    summary: "Sertifikat Sistem Manajemen Energi ISO 50001:2018 yang mengonfirmasi bahwa perusahaan telah memenuhi seluruh persyaratan audit internasional dalam efisiensi energi.",
    points: [
      "Implementasi tata kelola konsumsi energi berbasis siklus PDCA (Plan - Do - Check - Act).",
      "Audit kepatuhan berkala untuk memastikan penurunan intensitas energi tahunan secara konsisten."
    ]
  },
  {
    title: "Certificate of Completion — MCAP 2026",
    badge: "Sertifikat • MCAP",
    badgeClass: "",
    img: "assets/sertifikat/mcap.jpeg",
    alt: "Certificate of Completion MCAP",
    summary: "Sertifikat penyelesaian Manufacturer Climate Action Program (MCAP) periode Oktober 2024 hingga Maret 2026 yang diinisiasi oleh Cascale bagi PT Pratama Abadi Industri.",
    points: [
      "Validasi target penurunan emisi berbasis sains (Science-Based Targets).",
      "Integrasi langkah dekarbonisasi operasional dengan tolok ukur rantai pasok global."
    ]
  },
  {
    title: "Sertifikat POME",
    badge: "Sertifikat • POME",
    badgeClass: "",
    img: "assets/sertifikat/pome%202025.png",
    alt: "Sertifikat POME",
    summary: "Sertifikat apresiasi Pelaporan dan Optimalisasi Manajemen Energi (POME) atas keberhasilan tata kelola efisiensi energi terpadu pada fasilitas produksi perusahaan.",
    points: [
      "Konsistensi audit energi internal dan pelaporan kinerja berkala.",
      "Realisasi proyek konservasi energi yang berdampak langsung pada efisiensi biaya dan reduksi emisi."
    ]
  },
  {
    title: "Sertifikasi Pelatihan UK-PACT (EnB &amp; EnPI)",
    badge: "Sertifikat • UK-PACT Energy Performance",
    badgeClass: "badge-blue",
    img: "assets/sertifikat/uk-pact.png",
    alt: "Sertifikat Pelatihan UK-PACT EnB dan EnPI",
    summary: "Telah berpartisipasi dalam program pelatihan yang diselenggarakan oleh UK-PACT terkait Energy Baseline (EnB) dan Energy Performance Indicator (EnPI) guna memperkuat kompetensi tim energi.",
    points: [
      "Peningkatan kompetensi dalam penyusunan baseline energi serta penetapan indikator kinerja energi yang akurat.",
      "Evaluasi performa penggunaan energi sebagai dasar dalam mengidentifikasi peluang penghematan riil di lini operasional.",
      "Mendukung penerapan Sistem Manajemen Energi berdasarkan standar ISO 50001:2018 secara konsisten dan berkelanjutan."
    ]
  },
  {
    title: "Program SETI (Sustainable Energy Transition in Indonesia)",
    badge: "Sertifikat • Kemitraan SETI",
    badgeClass: "badge-green",
    img: "assets/sertifikat/SETI.png",
    alt: "Sertifikat Kemitraan Program SETI",
    summary: "Sustainable Energy Transition in Indonesia (SETI) merupakan proyek kolaboratif untuk mengakselerasi pencapaian target Net-Zero dan transisi energi industri di Indonesia.",
    points: [
      "Proyek kerja sama Pemerintah Jerman dan Indonesia yang dipimpin DJEBTKE KESDM serta Pusat Industri Hijau Kemenperin.",
      "Mendukung implementasi efisiensi energi dan energi terbarukan pada sektor industri dengan konsumsi energi besar.",
      "Partisipasi aktif perusahaan sebagai wujud komitmen nyata terhadap keberlanjutan dan penurunan emisi karbon."
    ]
  },
  {
    title: "Forum &amp; Workshop Proyek SETI",
    badge: "Kegiatan • Kolaborasi Transisi Energi",
    badgeClass: "",
    img: "assets/kegiatan/SETI.jpeg",
    alt: "Kegiatan Forum dan Workshop Program SETI",
    summary: "Dokumentasi keterlibatan aktif tim Energy Conservation dalam agenda forum konsultasi dan lokakarya proyek SETI bersama Kementerian ESDM dan Kementerian Perindustrian.",
    points: [
      "Diskusi strategis percepatan transisi energi industri manufaktur nasional bersama mitra internasional.",
      "Harmonisasi roadmap penurunan emisi gas rumah kaca perusahaan dengan target dekarbonisasi nasional."
    ]
  },
  {
    title: "Training Energy Awareness",
    badge: "Kegiatan • Edukasi Karyawan",
    badgeClass: "",
    img: "assets/kegiatan/Training%20Energy%20Awereness.jpeg",
    alt: "Training Energy Awareness untuk karyawan",
    summary: "Pelatihan dan sosialisasi berkala budaya hemat energi kepada seluruh karyawan operasional di fasilitas produksi perusahaan.",
    points: [
      "Membangun pemahaman dan kepedulian terhadap target penurunan intensitas energi fasilitas.",
      "Mendorong kebiasaan hemat energi dan pengurangan pemborosan daya dalam rutinitas kerja harian."
    ]
  }
];

function initLightbox() {
  const modal      = document.getElementById('lightboxModal');
  const img        = document.getElementById('lightboxImg');
  const badge      = document.getElementById('lightboxBadge');
  const title      = document.getElementById('lightboxTitle');
  const desc       = document.getElementById('lightboxDesc');
  const counter    = document.getElementById('lightboxCounter');
  const closeBtn   = document.getElementById('lightboxClose');
  const prevBtn    = document.getElementById('lightboxPrev');
  const nextBtn    = document.getElementById('lightboxNext');

  const cards = Array.from(document.querySelectorAll('.gallery-card'));
  let currentIndex = 0;

  function renderItem(idx) {
    if (idx < 0) idx = GALLERY_ITEMS_DATA.length - 1;
    if (idx >= GALLERY_ITEMS_DATA.length) idx = 0;
    currentIndex = idx;

    const data = GALLERY_ITEMS_DATA[idx];
    if (!data) return;

    if (img) {
      img.style.opacity = '0';
      img.src = data.img;
      img.alt = data.alt || data.title;
      img.onload = () => { img.style.opacity = '1'; };
    }

    if (badge) {
      badge.innerHTML = data.badge;
      badge.className = 'lightbox-badge ' + (data.badgeClass || '');
    }

    if (title) {
      title.innerHTML = data.title;
    }

    if (counter) {
      counter.textContent = (idx + 1) + ' / ' + GALLERY_ITEMS_DATA.length;
    }

    if (desc) {
      let html = '<p class="lb-summary">' + data.summary + '</p>';
      if (data.points && data.points.length > 0) {
        html += '<div class="lb-points-card">';
        html += '  <div class="lb-points-title">';
        html += '    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>';
        html += '    <span>Poin Kunci &amp; Sasaran Strategis</span>';
        html += '  </div>';
        html += '  <ul class="lb-points-list">';
        data.points.forEach(pt => {
          html += '    <li>' + pt + '</li>';
        });
        html += '  </ul>';
        html += '</div>';
      }
      desc.innerHTML = html;
    }
  }

  // Event listener per card
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      renderItem(index);
      if (modal) modal.classList.add('active');
      if (typeof lenis !== 'undefined' && lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
    });
  });

  // Navigasi Prev & Next
  function showPrev() {
    renderItem(currentIndex - 1);
  }
  function showNext() {
    renderItem(currentIndex + 1);
  }

  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  function closeLightbox() {
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeLightbox();
    });
  }

  document.addEventListener('keydown', e => {
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPrev();
    else if (e.key === 'ArrowRight') showNext();
  });
}

/* Floating Nav clicks + back to top */
function initFloatingNav() {
  document.querySelectorAll('.fnav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-target');
      if (targetId === 'ch-hero') {
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (targetId === 'ch-opening') {
        const stage = document.querySelector('.sx-stage-container');
        const stageTop = stage ? stage.offsetTop : 0;
        const stageH = stage ? stage.offsetHeight : window.innerHeight * 7;
        const targetY = stageTop + stageH * 0.42;
        if (lenis) lenis.scrollTo(targetY, { duration: 1.2 });
        else window.scrollTo({ top: targetY, behavior: 'smooth' });
        return;
      }
      const target = document.getElementById(targetId);
      if (target) {
        if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll hint click
  const scrollHint = document.getElementById('heroScrollHint');
  if (scrollHint) {
    scrollHint.addEventListener('click', () => {
      const next = document.getElementById('ch-pillars');
      if (lenis && next) lenis.scrollTo(next, { duration: 1.4 });
      else if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* Hero BG parallax (for sections outside stage) */
function initHeroBgParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(${1 + scrollY * 0.0003})`;
    }
  }, { passive: true });
}

/* ════════════════════════════════════════════════
   8. LOWER SECTIONS SCROLL-DRIVEN ANIMATIONS
   (Journey / Timeline, Gallery, Numbers, Visi, Closing)
   ════════════════════════════════════════════════ */
function initJourneyAndLowerAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // 1. Chapter 4: Timeline Journey Progress & Card Stagger
  const tlContainer = document.getElementById('timelineContainer');
  const tlProgress  = document.getElementById('timelineProgress');
  const tlItems     = document.querySelectorAll('.tl-item');

  if (tlContainer && tlProgress) {
    // Scrub the timeline progress bar down through the container
    gsap.fromTo(tlProgress, 
      { height: '0%' }, 
      {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: tlContainer,
          start: 'top 70%',
          end: 'bottom 80%',
          scrub: 0.4,
        }
      }
    );

    // Animate each timeline card with a clean slide-in & scale
    tlItems.forEach((item) => {
      const isLeft = item.classList.contains('tl-left');
      const card = item.querySelector('.tl-card');

      if (card) {
        gsap.fromTo(card,
          {
            opacity: 0,
            x: isLeft ? -45 : 45,
            scale: 0.94
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
              onEnter: () => item.classList.add('tl-active'),
              onLeaveBack: () => item.classList.remove('tl-active')
            }
          }
        );
      }
    });
  }

  // 2. Chapter 5: Gallery & Documentation
  // Cards are NOT part of the .jo-item IntersectionObserver system and carry no
  // CSS transition on transform/opacity, so this reveal is the single owner of
  // their entry animation. `once` prevents a re-animation when the user scrolls
  // back up, which used to visibly "pop" right after changing a filter.
  const galleryGrid = document.querySelector('.gallery-grid');
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
  if (galleryGrid && galleryCards.length) {
    galleryRevealTween = gsap.fromTo(galleryCards,
      { opacity: 0, y: 42, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: galleryGrid,
          start: 'top 84%',
          once: true
        }
      }
    );
  }

  // 3. Chapter 6: Numbers / Metrics Block Stagger
  const numbersSection = document.getElementById('ch-numbers');
  const numberBlocks = document.querySelectorAll('.number-block');
  if (numbersSection && numberBlocks.length) {
    gsap.fromTo(numberBlocks,
      { opacity: 0, y: 40, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.14,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: numbersSection,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // 4. Chapter 7: Visi & Misi Stagger
  const visiWrap = document.querySelector('.visi-wrap');
  const misiItems = document.querySelectorAll('.misi-journey-list li');
  if (visiWrap) {
    gsap.fromTo(visiWrap,
      { opacity: 0, y: 35, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: visiWrap,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
  if (misiItems.length) {
    gsap.fromTo(misiItems,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.misi-list-wrap',
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // 5. Chapter 8: Closing
  const closingSection = document.getElementById('ch-closing');
  if (closingSection) {
    const certRow = closingSection.querySelector('.closing-cert-row');
    const headline = closingSection.querySelector('.closing-headline');
    const sub = closingSection.querySelector('.closing-sub');
    const bgImg = closingSection.querySelector('.closing-bg img');

    if (bgImg) {
      gsap.to(bgImg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: closingSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    if (certRow) {
      gsap.fromTo(certRow.children,
        { opacity: 0, y: 24, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: certRow,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if (headline) {
      gsap.fromTo(headline,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headline,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if (sub) {
      gsap.fromTo(sub,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sub,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }
}

/* ════════════════════════════════════════════════
   8.5. CHAPTER 2.5: CARBON PERFORMANCE CHART & SCROLL ENGINE
   ════════════════════════════════════════════════ */
/* =============================================
   CHAPTER 2.5: CARBON PERFORMANCE DASHBOARD & CHART (TARGET TRACKING)
   ============================================= */

const CARBON_DATA = {
  scope1: {
    name: "Scope 1 (Emisi Langsung)",
    baselineYear: 2019,
    baselineVal: 11409,
    currentYear: 2025,
    currentVal: 8662,
    reductionVal: 2747,
    percentReduction: 24.1,
    maxY: 15000,
    yTicks: ["15K", "10K", "5K", "0"],
    years: [
      { year: "2019", isBaseline: true, target: 11409, actual: 11409, status: "Baseline", tagClass: "tag-baseline", note: "Titik tolak target acuan Scope 1" },
      { year: "2020", isBaseline: false, target: 10929, actual: 10024, status: "Ahead of Target", tagClass: "tag-ahead", note: "Lebih hemat 905 tCO₂e dari target tahunan" },
      { year: "2021", isBaseline: false, target: 10450, actual: 12862, status: "Over Target", tagClass: "tag-over", note: "Kenaikan beban produksi pasca-pandemi" },
      { year: "2022", isBaseline: false, target: 9971, actual: 11673, status: "Ahead of Prev", tagClass: "tag-ahead", note: "Penurunan -1,189 tCO₂e dari tahun 2021" },
      { year: "2023", isBaseline: false, target: 9971, actual: 9853, status: "Ahead of Target", tagClass: "tag-ahead", note: "Mencapai target efisiensi operasional" },
      { year: "2024", isBaseline: false, target: 9013, actual: 9556, status: "Dekat Target", tagClass: "tag-ahead", note: "Penurunan konsumsi energi lini press" },
      { year: "2025", isBaseline: false, target: 8534, actual: 8662, status: "Rekor -24.1%", tagClass: "tag-ahead", note: "Capaian terendah: reduksi 24.1% dari baseline 2019" }
    ]
  },
  scope2: {
    name: "Scope 2 (Listrik / EBT)",
    baselineYear: 2019,
    baselineVal: 73149,
    currentYear: 2025,
    currentVal: 0,
    reductionVal: 73149,
    percentReduction: 100.0,
    maxY: 90000,
    yTicks: ["90K", "60K", "30K", "0"],
    years: [
      { year: "2019", isBaseline: true, target: 73149, actual: 73149, status: "Baseline", tagClass: "tag-baseline", note: "Konsumsi daya listrik PLN non-EBT" },
      { year: "2020", isBaseline: false, target: 70077, actual: 60893, status: "Ahead of Target", tagClass: "tag-ahead", note: "Efisiensi operasional fasilitas" },
      { year: "2021", isBaseline: false, target: 67005, actual: 85084, status: "Over Target", tagClass: "tag-over", note: "Lonjakan volume produksi pabrik" },
      { year: "2022", isBaseline: false, target: 63932, actual: 54619, status: "Ahead of Target", tagClass: "tag-ahead", note: "Optimasi sistem utilitas & motor listrik" },
      { year: "2023", isBaseline: false, target: 60860, actual: 55264, status: "Ahead of Target", tagClass: "tag-ahead", note: "Standardisasi sistem manajemen energi ISO 50001" },
      { year: "2024", isBaseline: false, target: 57788, actual: 0, status: "Zero Emission", tagClass: "tag-zero", note: "100% Pasokan Listrik EBT via REC PLN" },
      { year: "2025", isBaseline: false, target: 54715, actual: 0, status: "Zero Emission", tagClass: "tag-zero", note: "Bebas Emisi Scope 2 (100% EBT Terverifikasi)" }
    ]
  },
  total: {
    name: "Total Scope 1 + 2 (Gabungan)",
    baselineYear: 2019,
    baselineVal: 84558,
    currentYear: 2025,
    currentVal: 8662,
    reductionVal: 75896,
    percentReduction: 89.8,
    maxY: 105000,
    yTicks: ["100K", "75K", "50K", "0"],
    years: [
      { year: "2019", isBaseline: true, target: 84558, actual: 84558, status: "Baseline", tagClass: "tag-baseline", note: "Total emisi acuan awal Scope 1 & 2" },
      { year: "2020", isBaseline: false, target: 81006, actual: 70917, status: "Ahead of Target", tagClass: "tag-ahead", note: "Pengurangan 13,641 tCO₂e dari baseline" },
      { year: "2021", isBaseline: false, target: 77455, actual: 97946, status: "Over Target", tagClass: "tag-over", note: "Aktivitas produksi pasca-pandemi" },
      { year: "2022", isBaseline: false, target: 73903, actual: 66292, status: "Ahead of Target", tagClass: "tag-ahead", note: "Penurunan -31,654 tCO₂e dari tahun 2021" },
      { year: "2023", isBaseline: false, target: 70831, actual: 65116, status: "Ahead of Target", tagClass: "tag-ahead", note: "Penurunan berkelanjutan ke 65,116 tCO₂e" },
      { year: "2024", isBaseline: false, target: 66801, actual: 9556, status: "Lompatan Besar", tagClass: "tag-ahead", note: "Penurunan tajam -55,561 tCO₂e berkat 100% REC" },
      { year: "2025", isBaseline: false, target: 63249, actual: 8662, status: "Rekor -89.8%", tagClass: "tag-ahead", note: "Pengurangan total 89.8% dari baseline 2019" }
    ]
  }
};

function initCarbonPerformanceChart() {
  const section = document.getElementById('ch-carbon');
  if (!section) return;

  const scopeBtns = section.querySelectorAll('.cscope-btn');
  const kpiBaselineVal = document.getElementById('kpiBaselineVal');
  const kpiCurrentVal = document.getElementById('kpiCurrentVal');
  const kpiReductionVal = document.getElementById('kpiReductionVal');
  const kpiPercentVal = document.getElementById('kpiPercentVal');
  const chartYAxis = document.getElementById('chartYAxis');
  const columnsContainer = document.getElementById('carbonChartColumns');
  const transGlow = section.querySelector('.carbon-transition-glow');
  const trackingBanner = section.querySelector('.carbon-target-tracking-banner');
  const kpiStrip = section.querySelector('.carbon-kpi-strip');
  const chartWrap = section.querySelector('.carbon-chart-wrap');
  const tablesWrap = section.querySelector('.carbon-tables-wrap');

  let activeScope = 'scope1';

  function animateCounter(el, targetVal, prefix, suffix, isFloat) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          if (isFloat) {
            el.textContent = (prefix || '') + obj.val.toFixed(1) + (suffix || '');
          } else {
            el.textContent = (prefix || '') + Math.floor(obj.val).toLocaleString('id-ID') + (suffix || '');
          }
        }
      });
    } else {
      if (isFloat) {
        el.textContent = (prefix || '') + targetVal.toFixed(1) + (suffix || '');
      } else {
        el.textContent = (prefix || '') + Math.floor(targetVal).toLocaleString('id-ID') + (suffix || '');
      }
    }
  }

  function renderScope(scopeKey) {
    const data = CARBON_DATA[scopeKey];
    if (!data) return;
    activeScope = scopeKey;

    // 1. Update 4 Kotak KPI
    animateCounter(kpiBaselineVal, data.baselineVal, '', ' tCO₂e', false);
    animateCounter(kpiCurrentVal, data.currentVal, '', ' tCO₂e', false);
    animateCounter(kpiReductionVal, data.reductionVal, '-', ' tCO₂e', false);
    animateCounter(kpiPercentVal, data.percentReduction, '-', '%', true);

    // 2. Update Y-Axis Labels
    if (chartYAxis && data.yTicks) {
      chartYAxis.innerHTML = data.yTicks.map(t => `<span>${t}</span>`).join('');
    }

    // 3. Render 7 Columns (2019 - 2025)
    if (columnsContainer) {
      columnsContainer.innerHTML = '';
      const maxY = data.maxY;

      data.years.forEach((item, idx) => {
        const col = document.createElement('div');
        col.className = 'chart-col' + (idx === 0 ? ' col-pos-first' : '') + (idx === data.years.length - 1 ? ' col-pos-last' : '');
        col.tabIndex = 0;

        const targetPct = Math.min(100, Math.max(0, (item.target / maxY) * 100));
        const actualPct = Math.min(100, Math.max(0, (item.actual / maxY) * 100));
        const isZero = item.actual === 0;

        col.innerHTML = `
          <div class="col-delta-tag ${item.tagClass}">${item.status}</div>

          <div class="col-popover">
            <div class="pop-header">
              <span class="pop-year">Tahun ${item.year}</span>
              <span class="pop-badge ${item.tagClass}">${item.status}</span>
            </div>
            <div class="pop-body">
              <div class="pop-row">
                <span class="pop-dot dot-target"></span>
                <span>Target: <b>${item.target.toLocaleString('id-ID')} tCO₂e</b></span>
              </div>
              <div class="pop-row">
                <span class="pop-dot dot-actual"></span>
                <span>Aktual: <b>${item.actual.toLocaleString('id-ID')} tCO₂e</b></span>
              </div>
            </div>
            <div class="pop-formula">${item.note}</div>
          </div>

          <div class="col-bars">
            <div class="bar-wrap" title="Target: ${item.target.toLocaleString('id-ID')} tCO₂e">
              <div class="bar bar-target" style="height: ${targetPct.toFixed(1)}%;"></div>
            </div>
            <div class="bar-wrap" title="Aktual: ${item.actual.toLocaleString('id-ID')} tCO₂e">
              <div class="bar bar-actual ${isZero ? 'is-zero' : ''}" style="height: ${isZero ? '6px' : actualPct.toFixed(1) + '%'};"></div>
            </div>
          </div>

          <div class="col-year-label">${item.year}</div>
          <div class="col-val-label">${item.actual.toLocaleString('id-ID')}</div>
        `;

        // Click on col to toggle active popover on mobile
        col.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasActive = col.classList.contains('active-col');
          section.querySelectorAll('.chart-col').forEach(c => c.classList.remove('active-col'));
          if (!wasActive) col.classList.add('active-col');
        });

        columnsContainer.appendChild(col);
      });

      // Animate bars entrance
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(columnsContainer.querySelectorAll('.bar'),
          { scaleY: 0, transformOrigin: 'bottom' },
          { scaleY: 1, duration: 0.85, stagger: 0.04, ease: 'power3.out' }
        );
      }
    }
  }

  // Dismiss active popover on outside click
  document.addEventListener('click', () => {
    section.querySelectorAll('.chart-col').forEach(c => c.classList.remove('active-col'));
  });

  // Scope Switcher Buttons
  scopeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scopeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scope = btn.getAttribute('data-scope');
      renderScope(scope);
    });
  });

  // Initial Render (Scope 1 default)
  renderScope('scope1');

  // GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const carbonInner = section.querySelector('.container-wide');
    if (carbonInner) {
      gsap.fromTo(carbonInner,
        { opacity: 0.25, y: 50 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 92%',
            end: 'top 60%',
            scrub: 0.4
          }
        }
      );
    }

    if (transGlow) {
      gsap.fromTo(transGlow,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.95,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 92%',
            end: 'top 45%',
            scrub: true
          }
        }
      );
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      }
    });

    if (trackingBanner) {
      tl.fromTo(trackingBanner,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power2.out' },
        0
      );
    }

    const kpiCards = section.querySelectorAll('.ckpi-card');
    if (kpiCards.length) {
      tl.fromTo(kpiCards,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
        0.15
      );
    }

    if (chartWrap) {
      tl.fromTo(chartWrap,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        0.3
      );
    }

    if (tablesWrap) {
      tl.fromTo(tablesWrap,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        0.45
      );
    }
  }
}


/* ════════════════════════════════════════════════
   9. BOOT SEQUENCE
   ════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // 0. Mark body for GSAP transition smoothness
  document.body.classList.add('sx-gsap-active');

  // 1. Setup scroll height for sticky stage
  setStageHeight();

  // 2. Init smooth scroll (Lenis) — must before ScrollTrigger
  initLenis();

  // 3. Build GSAP master timeline + interactive stepper + lower sections
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    buildMasterTimeline();
    initOpsSectionAnimations();
    initCarbonPerformanceChart();
    initJourneyAndLowerAnimations();

    // Refresh after all fonts + images load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  // 4. Fixed UI
  initScrollUI();

  // 5. Original features
  initChapterDots();
  initScrollReveal();
  initSpotlight();
  initCounters();
  initGalleryFilters();
  initLightbox();
  initFloatingNav();
  initHeroBgParallax();

  // 6. Re-measure on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setStageHeight();
      ScrollTrigger.refresh();
    }, 200);
  });
});