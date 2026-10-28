// VibeAudit launch film, Layer B.
// Every element's state is a pure function of t (seconds). No rAF, no CSS transitions.
// Driven by HyperFrames (GSAP proxy tween below) or by window.setT(t) for the Playwright fallback.
(function () {
  const FPS = 60;
  const qs = new URLSearchParams(location.search);
  const CFG = Object.assign({ ar: '16x9', mode: 'main' }, window.VA_CFG || {});
  if (qs.get('ar')) CFG.ar = qs.get('ar');
  if (qs.get('mode')) CFG.mode = qs.get('mode');
  document.body.dataset.ar = CFG.ar;
  if (CFG.mode === 'overlay') document.body.classList.add('alpha');
  const OVERLAY_OFFSET = 27.5; // overlay comp local 0 == film 27.5s

  // ---- content (sync so the first seek already has text) ----
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'content.json', false);
  xhr.send();
  const C = JSON.parse(xhr.responseText);

  // ---- tiny DOM helpers ----
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const badge = ([label, color]) => el('span', 'badge fl ' + color, label);

  // ---- build ----
  const stage = $('#stage');

  // hook
  const hook = $('#hook');
  const hook1 = el('div', 'line'), hook2 = el('div', 'line');
  hook.append(hook1, hook2);

  // report
  const col = $('#report .col');
  const termLine = $('.term-line', col);
  const title = $('h1.title', col);
  title.append(document.createTextNode(C.header.titlePrefix), el('span', 'tgt', C.header.titleTarget));
  const status = $('.status', col);
  status.append(el('b', null, C.status.lead), document.createTextNode(C.status.body));
  const section = $('h2.section', col);
  section.append(el('span', 'p', '> '), document.createTextNode(C.section));

  // hero
  const hero = $('.card.hero', col);
  const H2 = C.issues[hero.dataset.issue];
  const heroTitle = el('h3', 'fl', H2.title);
  const heroBadges = el('div', 'badges');
  const badgeSev = badge(H2.badges[0]);
  const badgeFixed = badge(H2.badges[1]);
  heroBadges.append(badgeSev, badgeFixed);
  const what = el('p'); what.append(el('b', null, C.labels.what), document.createTextNode(' ' + H2.what));
  const repro = el('p'); repro.append(el('b', null, C.labels.repro), document.createTextNode(' ' + H2.repro));
  const fixBox = el('div', 'fixbox fl');
  const fixText = el('span'); const fixCur = el('span', 'cursor');
  const copied = el('div', 'copied', C.labels.copied);
  const blockCur = el('div', 'blockcur');
  fixBox.append(fixText, fixCur, copied, blockCur);
  const recheck = el('div', 'recheck', H2.recheckLabel);
  hero.append(heroTitle, heroBadges, what, repro, fixBox, recheck);

  // compact cards
  const compacts = [...col.querySelectorAll('.card.compact')].map(card => {
    const d = C.issues[card.dataset.issue];
    const b = el('div', 'badges'); const bs = d.badges.map(badge); b.append(...bs);
    card.append(el('h3', null, d.title), b);
    return { card, fixed: bs[1] };
  });

  // open loop card
  const loop = $('.card.loop', col);
  const L = C.issues[loop.dataset.issue];
  const lb = el('div', 'badges'); lb.append(...L.badges.map(badge));
  const lp = el('p'); lp.append(el('b', null, L.recheckLabel), document.createTextNode(L.recheck));
  loop.append(el('h3', null, L.title), lb, lp);

  // close
  const close = $('#close');
  const closeWords = C.close.map((w, i) => el('div', 'w' + (i === C.close.length - 1 ? ' g' : ''), w));
  close.append(...closeWords);

  // cta
  const cta = $('#cta');
  const ctaH = el('h2', null, C.cta.heading);
  const ctaSub = el('div', 'sub', C.cta.sub);
  const btns = el('div', 'btns');
  const btn1 = el('div', 'btn primary', C.cta.primary);
  const btn2 = el('div', 'btn secondary', C.cta.secondary);
  btns.append(btn1, btn2);
  const refund = el('div', 'refund', C.cta.refund);
  cta.append(ctaH, ctaSub, btns, refund);

  // wordmark + url
  const wmWrap = $('#wordmark');
  const wm = el('div', 'wm'); wm.append(el('span', 'v', C.wordmark[0]), el('span', 'a', C.wordmark[1]));
  wmWrap.append(wm);
  const urlOverlay = $('#url-overlay'); urlOverlay.textContent = C.url;

  // ---- timing helpers ----
  let t = 0, F = 0;
  const clamp01 = x => Math.min(1, Math.max(0, x));
  const prog = (s, e) => clamp01((t - s) / (e - s));
  const lerp = (a, b, s, e) => a + (b - a) * prog(s, e);
  const on = s => F >= Math.round(s * FPS);
  const isFlash = s => F === Math.round(s * FPS);
  const typed = (str, start, cps) => str.slice(0, Math.max(0, Math.floor((t - start) * cps + 1e-6)));
  const show = (e, v) => e.classList.toggle('on', !!v);
  const vis = (e, v) => e.classList.toggle('hide', !v);
  const flash = (e, v) => e.classList.toggle('flash', !!v);
  const easeInOutCubic = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const easeOutQuart = x => 1 - Math.pow(1 - x, 4);

  // ---- layout measurement (positions inside .col, independent of transform) ----
  const VH = CFG.ar === '9x16' ? 1920 : 1080;
  let S1 = 0, S2 = 0;
  function measure() {
    const top = e => e.offsetTop;
    const sectionTop = top(section);
    const heroBottom = top(hero) + hero.offsetHeight;
    // centre the section heading + hero card block; whole card must fit
    S1 = sectionTop - Math.max(40, (VH - (heroBottom - sectionTop)) / 2);
    const loopCenter = top(loop) + loop.offsetHeight / 2;
    S2 = loopCenter - VH / 2;
  }
  function scrollAt(tt) {
    if (tt < 7.5) return 0;
    if (tt < 9.0) return S1 * easeInOutCubic((tt - 7.5) / 1.5);
    if (tt < 19.0) return S1;
    if (tt < 21.6) return S1 + (S2 - S1) * easeOutQuart((tt - 19.0) / 2.6);
    return S2;
  }

  // ---- render(t) ----
  function render(tIn) {
    tIn += CFG.offset != null ? CFG.offset : (CFG.mode === 'overlay' ? OVERLAY_OFFSET : 0);
    t = tIn; F = Math.round(t * FPS);
    measure();

    if (CFG.mode === 'overlay') {
      [hook, $('#report'), close, cta].forEach(e => show(e, false));
      show(wmWrap, t >= 27.5);
      const s = lerp(0.96, 1.0, 27.5, 28.5);
      wm.style.transform = `scale(${s})`;
      wm.style.opacity = lerp(0, 1, 27.5, 27.9);
      show(urlOverlay, on(28.5));
      return;
    }
    show(wmWrap, false); show(urlOverlay, false);

    // blocks
    show(hook, t >= 2.0 && t < 5.0);
    show($('#report'), t >= 5.0 && t < 24.0);
    show(close, t >= 24.0 && t < 25.6);
    show(cta, t >= 25.6 && t < 27.5);

    // hook
    const h1 = typed(C.hook[0], 2.0, 28), h2 = on(2.9) ? typed(C.hook[1], 2.9, 30) : '';
    hook1.textContent = h1; hook2.textContent = h2;
    const blink = Math.floor(t * 2) % 2 === 0;
    const cur1 = el('span', 'cursor'), cur2 = el('span', 'cursor');
    if (!on(2.9)) hook1.append(cur1); else if (h2.length < C.hook[1].length || blink) hook2.append(cur2);

    // status
    termLine.textContent = typed(C.header.term, 5.0, 36);
    if (t < 6.2) termLine.append(el('span', 'cursor'));
    vis(title, on(6.0));
    status.style.opacity = lerp(0, 1, 6.2, 6.5);
    status.style.transform = `translateY(${lerp(20, 0, 6.2, 6.5)}px)`;
    vis(section, t >= 7.5);

    // scroll
    col.style.transform = `translateY(${-scrollAt(t)}px)`;

    // hero build
    vis(hero, on(9.0));
    vis(heroTitle, on(9.0)); flash(heroTitle, isFlash(9.0));
    vis(badgeSev, on(9.6)); flash(badgeSev, isFlash(9.6));
    what.style.opacity = lerp(0, 1, 10.0, 10.3);
    vis(repro, on(11.0)); flash(repro, false);
    vis(fixBox, on(12.0));
    const fixCps = H2.fix.length / 2.5; // whole prompt lands by 14.5 (see README deviations)
    fixText.textContent = typed(H2.fix, 12.0, fixCps);
    fixCur.style.display = (t >= 12.0 && t < 14.6) ? 'inline-block' : 'none';
    // white block cursor glides in to the box, then "copy" flash
    const cp = easeInOutCubic(prog(14.6, 15.0));
    blockCur.style.display = (t >= 14.6 && t < 15.6) ? 'block' : 'none';
    const bw = fixBox.offsetWidth, bh = fixBox.offsetHeight;
    blockCur.style.left = `${bw + 120 + (bw * 0.55 - bw - 120) * cp}px`;
    blockCur.style.top = `${bh + 160 + (bh * 0.45 - bh - 160) * cp}px`;
    flash(fixBox, isFlash(15.0));
    copied.style.display = (t >= 15.0 && t < 15.6) ? 'block' : 'none';
    vis(recheck, on(16.5));
    // Fixed badge only after the re-check label is on screen
    vis(badgeFixed, on(17.5));
    badgeFixed.style.transform = `scale(${on(17.5) ? lerp(1.15, 1.0, 17.5, 17.5 + 6 / FPS) : 1.15})`;

    // depth scroll: compact cards appear for the scroll; each Fixed badge flashes once as it crosses centre
    const sNow = scrollAt(t), sPrev = scrollAt(t - 1 / FPS);
    compacts.forEach(({ card, fixed }) => {
      vis(card, t >= 19.0);
      const c = card.offsetTop + card.offsetHeight / 2;
      flash(fixed, t >= 19.0 && t < 22.0 && (c - sPrev) > VH / 2 && (c - sNow) <= VH / 2);
    });
    vis(loop, t >= 19.0);

    // close words
    closeWords.forEach((w, i) => { w.style.opacity = on(24.0 + i * 0.4) ? 1 : 0; });

    // cta
    btn1.style.opacity = on(25.8) ? 1 : 0;
    btn2.style.opacity = on(26.0) ? 1 : 0;
  }

  // ---- drivers ----
  const DUR = CFG.dur || (CFG.mode === 'overlay' ? 2.5 : 30.0);
  window.setT = x => { render(x); return true; };
  const proxy = {};
  let _t = 0;
  Object.defineProperty(proxy, 't', { get: () => _t, set: v => { _t = v; render(v); } });
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(proxy, { t: 0 }, { t: DUR, duration: DUR, ease: 'none', immediateRender: false }, 0);
  window.__timelines = window.__timelines || {};
  window.__timelines[CFG.root || 'main'] = tl;
  const q0 = qs.get('t');
  render(q0 != null ? parseFloat(q0) : 0);
  // re-render once webfonts are in (card heights change)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { render(_t || (q0 != null ? parseFloat(q0) : 0)); window.__vaReady = true; });
})();
