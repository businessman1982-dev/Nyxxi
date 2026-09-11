/* ═══════════════════════════════════════════════════════════════════
   NYXXI — scroll-film engine (Lane A: pure-code GSAP + Lenis)

   The page is one continuous descent in five chapters:
     I   VOID        a point of violet light in the dark
     II  INVOCATION  the light opens into a sigil; sentences pour in
     III EMBODIMENT  the sigil prints a character, then multiplies
     IV  WARDROBE    a horizontal rack of looks, pinned
     V   THE VAULT   everything ever made ignites, then blooms to bone

   ORDERING LAW: every pinned scene is created before any ambient
   ScrollTrigger. Creation order is refresh order — an ambient trigger
   created before a pin computes its position without that pin's spacer
   and silently fires thousands of pixels early.
   ═══════════════════════════════════════════════════════════════════ */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './fonts.css'
import './landing.css'
import { initRates, initSignup } from './rates.js'

/* The terms render before any ScrollTrigger is created: injecting the rate cards
   changes document height, and a trigger measured against the pre-injection
   height lands in the wrong place. */
initRates()
initSignup()

gsap.registerPlugin(ScrollTrigger)

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

const JUMP = new URLSearchParams(location.search).get('jump')
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches
if (JUMP !== null) history.scrollRestoration = 'manual'

/* ── film grain (one generated tile, reused by every noise surface) ── */
function noiseURL(size = 128) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 26
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}
document.documentElement.style.setProperty('--noise', `url(${noiseURL()})`)

/* ═══════════ DOM the film needs but markup shouldn't carry ═══════════ */

/* wordmark → per-character spans, each in an overflow-hidden wrap */
function splitMark(el) {
  const glyphs = []
  el.innerHTML = [...el.textContent.trim()]
    .map((c) => `<span class="ch-wrap"><span class="ch-glyph">${c}</span></span>`)
    .join('')
  $$('.ch-glyph', el).forEach((g) => glyphs.push(g))
  return glyphs
}
const heroGlyphs = splitMark($('.hero__mark'))

/* sigil tick marks */
{
  const ticks = $('.s-ticks')
  let d = ''
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const long = i % 4 === 0
    const r1 = 150
    const r2 = long ? 138 : 145
    d += `<line x1="${200 + Math.cos(a) * r1}" y1="${200 + Math.sin(a) * r1}" x2="${
      200 + Math.cos(a) * r2}" y2="${200 + Math.sin(a) * r2}" />`
  }
  ticks.innerHTML = d
}

/* the sentences that pour into the sigil */
const PROMPT_LINES = [
  'cold key light, 35mm, shallow depth',
  'matte black plate, hard shadow',
  'selene / ref-sheet-02 / three-quarter',
  'volumetric haze, low angle',
  'wardrobe: midnight silk, full length',
  'no warm cast — keep the grade',
  'rim light from camera left',
  'grain 400, halation soft',
  'izumi / neutral expression / eye level',
  'seed locked, batch of four',
  'ash linen, daylight, flat grade',
  'portrait, chest up, centred',
]
const streamEls = (() => {
  const wrap = $('#stream')
  return PROMPT_LINES.map((t, i) => {
    const s = document.createElement('span')
    s.textContent = t
    /* every line enters from the right so none ever crosses the copy
       block on the left; the ragged settle column keeps them legible */
    s.dataset.settle = String(0.03 + (i % 4) * 0.045)
    s.dataset.yf = String((8 + ((i * 7.3) % 84) - 50) / 100)
    wrap.appendChild(s)
    return s
  })
})()

/* the vault grid + the little vault visual in the light section */
const VAULT_TINTS = [
  'linear-gradient(200deg,#6f66c9,#1a1630)',
  'linear-gradient(200deg,#2f2b40,#0b0a14)',
  'linear-gradient(200deg,#c4834f,#2a1a13)',
  'linear-gradient(200deg,#4a7f96,#101d26)',
  'linear-gradient(200deg,#8b7ff0,#241f3d)',
  'linear-gradient(200deg,#3a3a44,#0d0d12)',
]
const vaultTiles = (() => {
  const grid = $('#vaultGrid')
  const els = []
  for (let i = 0; i < 32; i++) {
    const el = document.createElement('i')
    el.style.background = VAULT_TINTS[(i * 7 + ((i * i) % 5)) % VAULT_TINTS.length]
    grid.appendChild(el)
    els.push(el)
  }
  return els
})()
{
  const v = $('.vis-vault')
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('i')
    el.style.background = VAULT_TINTS[(i * 7 + ((i * i) % 5)) % VAULT_TINTS.length]
    v.appendChild(el)
  }
}

/* real brand marks, not approximations (paths from simple-icons) */
const SOCIALS = [
  ['GitHub', 'https://github.com', 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'],
  ['X', 'https://x.com', 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'],
  ['Discord', 'https://discord.com', 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z'],
  ['YouTube', 'https://youtube.com', 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'],
]
$('#social').innerHTML = SOCIALS.map(
  ([name, href, d]) =>
    `<a href="${href}" rel="noopener noreferrer" target="_blank" aria-label="${name}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg></a>`
).join('')

/* grain + vignette overlays (faded out at the film→content seam) */
const grain = Object.assign(document.createElement('div'), { className: 'film-grain' })
const vig = Object.assign(document.createElement('div'), { className: 'film-vig' })
document.body.append(grain, vig)

/* ═══════════════════ SMOOTH SCROLL ═══════════════════ */
let lenis = null
if (!REDUCED && JUMP === null) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* ═══════════════════ THE FILM ═══════════════════
   One sticky stage, one master timeline, 100 units long. Chapters overlap
   at their boundaries and hand off by transform — the light of one scene
   becomes the seed of the next — so the camera never cuts and never
   scrolls. Every chapter is a slice of the same shot.
   ══════════════════════════════════════════════════════════════════ */

const CHAPTERS = [
  { id: '#ch1', num: 'I', name: 'VOID', at: 0 },
  { id: '#ch2', num: 'II', name: 'INVOCATION', at: 18 },
  { id: '#ch3', num: 'III', name: 'EMBODIMENT', at: 40 },
  { id: '#ch4', num: 'IV', name: 'WARDROBE', at: 60 },
  { id: '#ch5', num: 'V', name: 'THE VAULT', at: 82 },
]

const filmEl = $('#film')
const filmLen = () => Math.max(1, filmEl.offsetHeight - innerHeight)
/* a master-timeline unit (0-100) as an absolute scroll position */
const at = (t) => () => filmEl.offsetTop + filmLen() * (t / 100)

const rackTrack = $('#rackTrack')
const runDist = () => Math.max(1, rackTrack.scrollWidth - innerWidth)

const scrubbed = []

if (!REDUCED) {
  gsap.set(['#ch2', '#ch3', '#ch4', '#ch5'], { autoAlpha: 0 })

  const starPath = $('.s-star')
  const ringPath = $('.s-ring')
  ;[starPath, ringPath].forEach((p) => {
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
  })

  const film = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#film',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
  scrubbed.push(film)

  film
    /* ── I · VOID — the mark burns off, the glow collapses to a point ── */
    .to('#cue', { opacity: 0, duration: 3 }, 0)
    .to('.hero__eyebrow', { opacity: 0, y: -30, duration: 6 }, 1)
    .to('.hero__sub', { opacity: 0, y: -40, duration: 8 }, 1)
    .to(heroGlyphs, { yPercent: -120, opacity: 0, stagger: 1.1, duration: 9 }, 2)
    .fromTo('#voidGlow', { scale: 1 }, { scale: 0.04, duration: 20, ease: 'power2.in' }, 0)
    .to('.hero', { opacity: 0, duration: 4 }, 9)
    .set('#ch1', { autoAlpha: 0 }, 21)

    /* ── II · INVOCATION — that point opens into the sigil ── */
    .set('#ch2', { autoAlpha: 1 }, 15)
    .fromTo(
      '#sigil',
      { scale: 0.04, opacity: 0, rotate: -40 },
      { scale: 1, opacity: 1, rotate: 0, duration: 13, ease: 'power2.out' },
      16
    )
    .fromTo(
      '.sigil__core',
      { scale: 2.6, opacity: 1 },
      { scale: 0.5, opacity: 0.85, duration: 15 },
      16
    )
    .to([starPath, ringPath], { strokeDashoffset: 0, duration: 11 }, 20)
    /* Seed the start state with .set() rather than relying on fromTo:
       in a scrubbed timeline a staggered fromTo only writes its "from"
       to targets whose own tween has already begun — the rest sit at
       their CSS position, piled at the centre. */
    .set(
      streamEls,
      {
        x: () => innerWidth * 0.78,
        y: (i) => +streamEls[i].dataset.yf * innerHeight * 1.15,
        opacity: 0,
      },
      18
    )
    .to(
      streamEls,
      {
        /* they settle into a legible column beside the ring, not a pile */
        x: (i) => +streamEls[i].dataset.settle * innerWidth,
        y: (i) => +streamEls[i].dataset.yf * innerHeight * 0.42,
        opacity: 1,
        duration: 12,
        stagger: { each: 0.55, from: 'random' },
        ease: 'power2.out',
      },
      19
    )
    /* …then the sigil swallows them */
    .to(
      streamEls,
      { x: 0, y: 0, scale: 0.25, opacity: 0, duration: 6, stagger: { each: 0.22, from: 'edges' } },
      31
    )
    .fromTo('.beat--ch2', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 5, ease: 'power2.out' }, 23)
    .to('.beat--ch2', { opacity: 0, y: -50, duration: 4 }, 35)
    .to('#sigil', { scale: 0.18, opacity: 0, rotate: 40, duration: 6 }, 36)
    .set('#ch2', { autoAlpha: 0 }, 43)

    /* ── III · EMBODIMENT — the collapsed sigil prints a character ── */
    .set('#ch3', { autoAlpha: 1 }, 37)
    .fromTo(
      '#plateA',
      { scale: 0.06, opacity: 0, rotateY: -30 },
      { scale: 1, opacity: 1, rotateY: 0, duration: 10, ease: 'power2.out' },
      38
    )
    .fromTo('#plateScan', { yPercent: -110 }, { yPercent: 110, duration: 10 }, 41
    )
    .fromTo('.plate__noise', { opacity: 0.9 }, { opacity: 0, duration: 9 }, 43)
    .fromTo('.plate__attrs', { opacity: 0 }, { opacity: 1, duration: 4 }, 50)
    .fromTo('.beat--ch3', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 5, ease: 'power2.out' }, 44)
    .fromTo(
      '.plate--b',
      { opacity: 0, x: 0, rotate: 0, scale: 1 },
      { opacity: 0.7, x: '-66%', rotate: -8, scale: 0.86, duration: 8, ease: 'power2.out' },
      50
    )
    .fromTo(
      '.plate--c',
      { opacity: 0, x: 0, rotate: 0, scale: 1 },
      { opacity: 0.7, x: '66%', rotate: 8, scale: 0.86, duration: 8, ease: 'power2.out' },
      50
    )
    .to('.beat--ch3', { opacity: 0, y: -40, duration: 4 }, 57)
    .to('#plates', { scale: 0.45, opacity: 0, duration: 6 }, 56)
    .set('#ch3', { autoAlpha: 0 }, 63)

    /* ── IV · WARDROBE — the rack runs sideways (see rackRun below) ── */
    .set('#ch4', { visibility: 'visible', opacity: 0 }, 57)
    .to('#ch4', { opacity: 1, duration: 4 }, 57)
    .fromTo('#wardrobeGhost', { xPercent: 10 }, { xPercent: -36, duration: 26 }, 58)
    .to('#ch4', { opacity: 0, duration: 5 }, 80)
    .set('#ch4', { autoAlpha: 0 }, 86)

    /* ── V · THE VAULT — everything ignites, then blooms to bone ── */
    .set('#ch5', { autoAlpha: 1 }, 78)
    .fromTo(
      '#vaultGrid',
      { scale: 2.9, rotateX: 26, yPercent: 12 },
      { scale: 0.68, rotateX: 0, yPercent: 0, duration: 15 },
      78
    )
    .set(vaultTiles, { opacity: 0, scale: 0.4 }, 78)
    .to(
      vaultTiles,
      {
        opacity: 1,
        scale: 1,
        duration: 8,
        stagger: { each: 0.16, from: 'center', grid: [4, 8] },
      },
      79
    )
    .fromTo('.beat--ch5', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 4, ease: 'power2.out' }, 84)
    .to('.beat--ch5', { opacity: 0, y: -30, duration: 3 }, 92)
    .fromTo('#bloom', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.8, duration: 11, ease: 'power2.in' }, 89)
    .to('#vaultGrid', { opacity: 0, duration: 5 }, 94)
    .fromTo('#bloomFlat', { opacity: 0 }, { opacity: 1, duration: 5 }, 95)
    .to({}, { duration: 0 }, 100)

  /* the horizontal run gets its own scrubbed tween, aligned to the film's
     chapter-IV slice, so its children can ride it via containerAnimation */
  const rackRun = gsap.to(rackTrack, {
    x: () => -runDist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#film',
      start: at(59),
      end: at(81),
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
  scrubbed.push(rackRun)

  $$('.fit').forEach((fit, i) => {
    gsap.fromTo(
      $('.fit__label', fit),
      { y: 36 },
      {
        y: -36,
        ease: 'none',
        scrollTrigger: {
          trigger: fit,
          containerAnimation: rackRun,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      }
    )
    gsap.fromTo(
      $('.fit__art', fit),
      { yPercent: i % 2 ? 6 : -6 },
      {
        yPercent: i % 2 ? -6 : 6,
        ease: 'none',
        scrollTrigger: {
          trigger: fit,
          containerAnimation: rackRun,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      }
    )
  })
}

/* ═══════════════════ AMBIENT ═══════════════════ */

const readoutNum = $('#readoutNum')
const readoutName = $('#readoutName')
const readoutFill = $('#readoutFill')
const readoutEl = $('#readout')
let shownChapter = -1
let lastFade = -1

ScrollTrigger.create({
  trigger: '#film',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const t = self.progress * 100
    let idx = 0
    for (let i = 0; i < CHAPTERS.length; i++) if (t >= CHAPTERS[i].at) idx = i
    if (idx !== shownChapter) {
      shownChapter = idx
      readoutNum.textContent = CHAPTERS[idx].num
      readoutName.textContent = CHAPTERS[idx].name
    }
    /* scaleX, not width: a percentage width relayouts on every scroll frame */
    readoutFill.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'
    /* the readout belongs to the film — retire it into the bloom */
    const fade = 1 - clamp((self.progress - 0.94) / 0.06, 0, 1)
    if (fade !== lastFade) {
      lastFade = fade
      readoutEl.style.opacity = (0.85 * fade).toFixed(3)
      grain.style.opacity = (0.055 * fade).toFixed(3)
      vig.style.opacity = (0.75 * fade).toFixed(3)
    }
  },
})

/* adaptive header: fixed chrome can't be one hard-coded colour over a film
   that ends in a white bloom. Flip at the bloom, flip back in the dark. */
ScrollTrigger.create({
  start: at(94),
  end: () => $('.close').offsetTop + innerHeight * 0.12 - 62,
  onToggle: (self) => $('#chrome').classList.toggle('on-light', self.isActive),
})

/* editorial reveals */
$$('[data-reveal], [data-split-lines]').forEach((el) => {
  /* clip-path repaints on every frame, which is fine for a line of type but
     costly for a whole feature row with an image panel in it */
  const heavy = el.classList.contains('row')
  gsap.fromTo(
    el,
    heavy ? { opacity: 0, y: 34 } : { clipPath: 'inset(0 0 100% 0)', y: 26 },
    {
      ...(heavy ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }),
      y: 0,
      duration: REDUCED ? 0 : 1.05,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    }
  )
})

/* counters */
$$('.fact b').forEach((el) => {
  const to = +el.dataset.count
  const suffix = el.dataset.suffix || ''
  const o = { v: 0 }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () =>
      gsap.to(o, {
        v: to,
        duration: REDUCED ? 0 : 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(o.v)).padStart(to >= 100 ? 1 : 2, '0') + suffix
        },
      }),
  })
})

/* marquee + velocity skew */
if (!REDUCED) {
  const row = $('#marqueeRow')
  gsap.to(row, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 })
  ScrollTrigger.create({
    onUpdate: (self) => {
      const skew = clamp(self.getVelocity() / -320, -9, 9)
      gsap.to(row, { skewX: skew, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
    },
  })
}

/* ── ambient hero embers: alive before the scrub starts, gone by 8% ── */
if (!REDUCED) {
  const cv = $('#embers')
  const ctx = cv.getContext('2d')
  const DPR = Math.min(devicePixelRatio || 1, 1.5)
  let W = 0
  let H = 0
  let alpha = 1
  let running = true

  /* one offscreen radial sprite — never shadowBlur */
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = 32
  {
    const s = sprite.getContext('2d')
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(220,212,255,1)')
    g.addColorStop(0.35, 'rgba(139,127,240,0.55)')
    g.addColorStop(1, 'rgba(139,127,240,0)')
    s.fillStyle = g
    s.fillRect(0, 0, 32, 32)
  }

  const P = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    d: 0.35 + Math.random() * 0.65, // depth: size, speed and alpha together
    sp: 0.00012 + Math.random() * 0.00035,
    dr: (Math.random() - 0.5) * 0.00016,
    ph: Math.random() * Math.PI * 2,
  }))

  const resize = () => {
    W = cv.clientWidth
    H = cv.clientHeight
    cv.width = W * DPR
    cv.height = H * DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  }
  resize()
  addEventListener('resize', resize)

  const draw = (t) => {
    if (!running) return
    ctx.clearRect(0, 0, W, H)
    if (alpha > 0.001) {
      for (const p of P) {
        p.y -= p.sp * p.d * 1000
        p.x += p.dr * 1000
        if (p.y < -0.05) {
          p.y = 1.05
          p.x = Math.random()
        }
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.0013 + p.ph)
        const size = 3 + p.d * 13
        ctx.globalAlpha = alpha * p.d * 0.55 * twinkle
        ctx.drawImage(sprite, p.x * W - size / 2, p.y * H - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }
    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)

  ScrollTrigger.create({
    trigger: '#film',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      alpha = 1 - clamp(self.progress / 0.08, 0, 1)
      if (alpha <= 0.001 && running) {
        running = false
        ctx.clearRect(0, 0, W, H)
      } else if (alpha > 0.001 && !running) {
        running = true
        requestAnimationFrame(draw)
      }
    },
  })
}

/* ── reduced motion: the film becomes five legible static panels ── */
if (REDUCED) {
  gsap.set(heroGlyphs, { clearProps: 'all' })
  gsap.set(['#sigil', '#plateA', '#vaultGrid', '.beat', '.plate__attrs'], { opacity: 1 })
  gsap.set('.plate__noise', { opacity: 0 })
  gsap.set('#plateScan', { opacity: 0 })
  gsap.set(streamEls, { opacity: 0 })
  gsap.set('#vaultGrid', { scale: 1, rotateX: 0 })
  gsap.set(vaultTiles, { opacity: 1, scale: 1 })
  gsap.set('#readout', { opacity: 0.85 })
} else if (JUMP === null) {
  /* hero entrance — the only non-scrubbed film beat. Skipped under ?jump:
     a .from() landing at its natural value would overwrite the scrubbed
     state the harness is trying to photograph. */
  gsap.from(heroGlyphs, {
    yPercent: 120,
    duration: 1.5,
    ease: 'power4.out',
    stagger: 0.07,
    delay: 0.25,
  })
  gsap.from('.hero__eyebrow, .hero__sub, #cue', {
    opacity: 0,
    y: 22,
    duration: 1.2,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.7,
  })
}

/* ═══════════════════ THE DEV CONTRACT ═══════════════════ */

function settle() {
  ScrollTrigger.refresh()
  if (JUMP !== null) {
    const y = +JUMP || 0
    scrollTo(0, y)
    ScrollTrigger.update()
    /* scrub is time-based catch-up — force every scrubbed animation to
       its exact position or the screenshot captures a half-played state */
    for (const anim of scrubbed) {
      const st = anim.scrollTrigger
      if (st) anim.totalProgress(st.progress).pause()
    }
    ScrollTrigger.update()
  }
}

const boot = $('#boot')

/* A chapter that has never been painted costs a long frame the first time it
   is revealed mid-scroll. Paint every one of them once behind the boot veil,
   then hide them again, so the handoffs are pure compositing. */
function warmChapters() {
  if (REDUCED) return Promise.resolve()
  gsap.set('.ch', { visibility: 'visible', opacity: 0.001 })
  return new Promise((r) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        gsap.set('#ch1', { visibility: 'visible', opacity: 1 })
        gsap.set(['#ch2', '#ch3', '#ch4', '#ch5'], { visibility: 'hidden', opacity: 0 })
        r()
      })
    )
  )
}

async function ready() {
  try {
    await document.fonts.ready
  } catch {
    /* fonts API unavailable — carry on */
  }
  await warmChapters()
  settle()
  boot.classList.add('is-gone')
  setTimeout(() => boot.remove(), 800)
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      settle()
      window.__ready = true
    })
  )
}
if (document.readyState === 'complete') ready()
else addEventListener('load', ready)

/* jank meter — judge p95/max, never average fps */
if (new URLSearchParams(location.search).has('jank')) {
  let last = performance.now()
  let deltas = []
  const tick = () => {
    const now = performance.now()
    deltas.push(now - last)
    last = now
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  setInterval(() => {
    if (!deltas.length) return
    const s = [...deltas].sort((a, b) => a - b)
    console.log('[jank] max', s[s.length - 1].toFixed(1), 'p95', s[(s.length * 0.95) | 0].toFixed(1))
    deltas = []
  }, 2000)
}
