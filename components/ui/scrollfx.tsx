'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';

/* ============================================================
   Scroll effects shared by the vertical sections.

   Everything here is driven by scroll position and only animates
   `transform` / `opacity`. Positions are read live from
   getBoundingClientRect, one rAF-coalesced listener for all
   subscribers, so they stay correct when the layout above them
   changes (the pinned Path grows the page after first paint,
   fonts swap, ...). That is why this is not framer's useScroll({target}),
   which caches a target's offset and would go stale.

   Without JS, or with prefers-reduced-motion, every effect is off
   and the content is simply there.
   ============================================================ */

/**
 * The pinned story needs a roomy window (a title column beside the cards, every scene inside one
 * screen) and no reduced-motion preference. Anything smaller gets the plain vertical page.
 */
export const PIN_QUERY =
  '(min-width: 1200px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function usePinned() {
  // false on the server and on the first client render, so hydration matches the unpinned page
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return pinned;
}

/** True once mounted and only if the visitor has not asked for reduced motion. */
export function useEffectsOn() {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => setMounted(true), []);
  return mounted && !reduce;
}

/* ---------- live scroll measurement ---------- */

type Sub = {
  get: () => Element | null;
  map: (r: DOMRect, vh: number) => number;
  mv: MotionValue<number>;
};

const subs = new Set<Sub>();
let frame = 0;
let bound = false;

function flush() {
  frame = 0;
  const vh = window.innerHeight;
  subs.forEach((s) => {
    const el = s.get();
    if (el) s.mv.set(s.map(el.getBoundingClientRect(), vh));
  });
}

/** Re-measure everything on the next frame (call after something changed the layout). */
export function refreshScrollValues() {
  if (typeof window !== 'undefined' && !frame) frame = requestAnimationFrame(flush);
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener('scroll', refreshScrollValues, { passive: true });
  window.addEventListener('resize', refreshScrollValues);
}

function unbind() {
  if (!bound || subs.size) return;
  bound = false;
  window.removeEventListener('scroll', refreshScrollValues);
  window.removeEventListener('resize', refreshScrollValues);
}

function useScrollSub(get: () => Element | null, map: Sub['map']) {
  const mv = useMotionValue(0);
  const latest = useRef({ get, map });
  latest.current = { get, map };
  useIsoLayoutEffect(() => {
    const sub: Sub = {
      get: () => latest.current.get(),
      map: (r, vh) => latest.current.map(r, vh),
      mv,
    };
    subs.add(sub);
    bind();
    const el = sub.get();
    if (el) mv.set(sub.map(el.getBoundingClientRect(), window.innerHeight));
    return () => {
      subs.delete(sub);
      unbind();
    };
  }, [mv]);
  return mv;
}

/** A motion value computed from an element's live viewport rect, refreshed on scroll and resize. */
export function useScrollValue(ref: RefObject<Element>, map: (r: DOMRect, vh: number) => number) {
  return useScrollSub(() => ref.current, map);
}

/** 0 at the top of the page, 1 at the bottom. */
export function usePageProgress() {
  return useScrollSub(
    () => (typeof document === 'undefined' ? null : document.documentElement),
    (r, vh) => clamp01(-r.top / Math.max(1, r.height - vh)),
  );
}

/** 0 when the element is just below the screen, 1 once it has just left the top. */
export const passThrough = (r: DOMRect, vh: number) => clamp01((vh - r.top) / (vh + r.height));

/* ---------- Reveal: a card rises and fades in as it scrolls into view (vertical page only) ---------- */

/**
 * Wraps one grid item. `lane` staggers neighbours: a higher lane has further to travel,
 * so a row of cards lands one after another instead of as a block.
 * Pass the grid-placement classes (col-span ...) here, not on the card inside.
 */
export function Reveal({
  children,
  className = '',
  lane = 0,
}: {
  children: ReactNode;
  className?: string;
  lane?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useEffectsOn();
  // 0 while the top edge is still below the fold, 1 once it is 2/3 of the way up the screen
  const p = useScrollValue(ref, (r, vh) => clamp01((vh * 0.98 - r.top) / (vh * 0.32)));
  const opacity = useTransform(p, [0, 0.7], [0, 1]);
  const y = useTransform(p, [0, 1], [44 + lane * 40, 0]);

  return (
    <motion.div ref={ref} className={className} style={on ? { opacity, y } : undefined}>
      {children}
    </motion.div>
  );
}

/* ---------- Ghost word: giant outlined text that stays behind a section and drifts sideways ---------- */

/**
 * Faint white fading downwards, no outline: the variable font's overlapping contours show up as
 * stray lines (a box across the A, letters crossing) as soon as the glyphs are stroked.
 */
export const GHOST_TEXT =
  'text-transparent bg-clip-text bg-gradient-to-b from-white/[0.10] to-white/[0.015] tracking-[-0.02em]';

export function GhostWord({ word, progress }: { word: string; progress: MotionValue<number> }) {
  const on = useEffectsOn();
  const x = useTransform(progress, [0, 1], ['10%', '-16%']);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-clip">
      {/* sticky: the word stays on screen for as long as the section does, the content scrolls over it */}
      <div className="sticky top-[18vh]">
        <motion.span
          style={on ? { x } : undefined}
          className={`block select-none whitespace-nowrap font-black leading-none ${GHOST_TEXT} ${
            word.length > 8 ? 'text-[15vw] md:text-[12vw]' : 'text-[24vw] md:text-[17vw]'
          }`}
        >
          {word}
        </motion.span>
      </div>
    </div>
  );
}

/* ---------- Section frame: title top-left and sticky, content on the right ---------- */

export function SectionShell({
  id,
  index,
  label,
  title,
  ghost,
  tone = 'text-indigo-400/80',
  titleTone = 'text-ink-100',
  children,
}: {
  id: string;
  index: string;
  label: string;
  title: ReactNode;
  ghost: string;
  tone?: string;
  titleTone?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const drift = useScrollValue(ref, passThrough);
  // how far through the section the reader is: starts when its top is at mid-screen
  const through = useScrollValue(ref, (r, vh) => clamp01((vh * 0.5 - r.top) / Math.max(1, r.height)));
  const on = useEffectsOn();

  return (
    <section ref={ref} id={id} className="relative">
      <GhostWord word={ghost} progress={drift} />
      <div className="relative mx-auto max-w-[1360px] px-4 md:px-8 pt-16 md:pt-24 pb-10 md:pb-16 lg:grid lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:gap-12">
        <header className="mb-8 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
          <p className={`font-mono text-[11px] uppercase tracking-[0.25em] mb-4 ${tone}`}>
            {index} / {label}
          </p>
          <h2 className={`text-3xl lg:text-[28px] xl:text-3xl font-bold tracking-tight leading-[1.15] ${titleTone}`}>
            {title}
          </h2>
          <div className="mt-6 hidden lg:block h-px w-24 bg-white/10 overflow-hidden">
            <motion.div
              style={on ? { scaleX: through } : undefined}
              className="h-full origin-left bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            />
          </div>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/* ---------- Words that light up one by one as the reader scrolls ---------- */

function ScrubWord({ word, i, n, progress }: { word: string; i: number; n: number; progress: MotionValue<number> }) {
  const start = (i / n) * 0.82;
  const opacity = useTransform(progress, [start, Math.min(1, start + 0.14)], [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{' '}
    </>
  );
}

export function ScrubWords({ text, progress }: { text: string; progress: MotionValue<number> }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <ScrubWord key={i} word={w} i={i} n={words.length} progress={progress} />
      ))}
    </>
  );
}

/* ---------- The "this goes sideways" arrow ---------- */

/** A long arrow that draws itself towards the right and keeps nudging that way. */
export function ArrowCue({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="-12 -12 464 120"
      fill="none"
      className={`arrow-cue overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id="arrow-cue-g" x1="0" y1="0" x2="440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <g className="arrow-cue-move">
        {/* glow: the same arrow, wider and faint (a CSS drop-shadow would be re-filtered on every animation frame) */}
        <g stroke="url(#arrow-cue-g)" strokeLinecap="round" strokeLinejoin="round" opacity="0.16">
          <path d="M6 48H410" pathLength={1} className="arrow-cue-line" strokeWidth="22" />
          <path d="M366 10L414 48L366 86" className="arrow-cue-head" strokeWidth="22" />
        </g>
        <g stroke="url(#arrow-cue-g)" strokeLinecap="round" strokeLinejoin="round" opacity="0.28">
          <path d="M6 48H410" pathLength={1} className="arrow-cue-line" strokeWidth="11" />
          <path d="M366 10L414 48L366 86" className="arrow-cue-head" strokeWidth="11" />
        </g>
        <path d="M6 48H410" pathLength={1} className="arrow-cue-line" stroke="url(#arrow-cue-g)" strokeWidth="5" strokeLinecap="round" />
        <path d="M366 10L414 48L366 86" className="arrow-cue-head" stroke="url(#arrow-cue-g)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
