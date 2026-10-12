'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { track } from '@vercel/analytics';
import { timelineEvents } from '@/lib/timeline';
import { PATH_ITEMS, PathCard, pathDot, pathKey, pathShort } from './Timeline';
import { ArrowCue, GHOST_TEXT, clamp01, useIsoLayoutEffect } from './scrollfx';
import { CARD_GAP, DWELL, SCENE, useStory } from './storyContext';

/* ============================================================
   Path: the one part of the site that scrolls sideways.

   It is a scene of the pinned story (Story.tsx). While it is the
   active scene, vertical scroll progress becomes a sideways translate
   of the strip, so wheel-down moves the cards left; a progress rail
   at the bottom is the timeline. Only `transform` and `opacity` of
   small layers animate: every per-frame element has its own compositor
   layer (will-change) so nothing is re-painted while moving, and cards
   dim with an overlay instead of opacity (opacity on a big card forces
   an offscreen render pass every frame).
   ============================================================ */

/** Rail entries: the intro is track child 0, one card follows per path item. */
const RAIL: { child: number; label: string; dot: string }[] = [
  { child: 0, label: 'Path', dot: 'bg-pink-500' },
  ...PATH_ITEMS.map((item, i) => ({ child: i + 1, label: pathShort(item), dot: pathDot(item) })),
];

type Geo = {
  vw: number;
  /** centre of every track child, in track coordinates */
  centers: number[];
  /** centres of the rail panels only */
  railCenters: number[];
  /** distance between two neighbouring cards */
  pitch: number;
};

const PANEL_PAD = 'pt-[136px] pb-[96px]'; // room for the nav and the heading above, the rail below

/** Left edge of the page content column, so the intro lines up with the headings of the other scenes. */
const COLUMN_LEFT = 'max(2rem, calc((var(--vw) - 1360px) / 2 + 2rem))';

/** px distance of a panel's centre from the screen centre; 0 = centred, negative = panel is to the right */
function usePanelOffset(
  index: number,
  x: MotionValue<number>,
  geoRef: { current: Geo },
  geoTick: MotionValue<number>,
) {
  return useTransform([x, geoTick], ([xv]: number[]) => {
    const g = geoRef.current;
    const c = g.centers[index];
    return c === undefined ? 0 : -xv + g.vw / 2 - c;
  });
}

/** First screen of the Path: a giant word, a long arrow pointing right, and the first card peeking in. */
function IntroPanel({ x }: { x: MotionValue<number> }) {
  // the word moves at half the strip's speed, which reads as depth
  const ghostX = useTransform(x, (v) => -v * 0.5);
  const first = timelineEvents[0];

  return (
    <div data-panel className="relative shrink-0 h-full" style={{ width: 'min(54vw, 760px)' }}>
      <motion.div
        aria-hidden="true"
        style={{ x: ghostX, left: COLUMN_LEFT }}
        className="absolute top-[136px] pointer-events-none select-none will-change-transform"
      >
        <span className={`block font-black leading-none ${GHOST_TEXT} text-[min(19vw,30svh)]`}>PATH</span>
      </motion.div>
      <div className="relative h-full flex flex-col justify-end pb-[120px] pr-6" style={{ paddingLeft: COLUMN_LEFT }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-pink-300/80 mb-4">Keep scrolling</p>
        <ArrowCue className="h-auto w-[min(42vw,590px)]" />
        <p className="mt-5 font-mono text-[12px] text-ink-400">
          {first.date} → now · oldest first · the page moves sideways
        </p>
      </div>
    </div>
  );
}

/** A Path card: full size when centred, receding as the strip carries it away. */
function CardPanel({
  index,
  x,
  geoRef,
  geoTick,
  children,
}: {
  index: number;
  x: MotionValue<number>;
  geoRef: { current: Geo };
  geoTick: MotionValue<number>;
  children: (shotX: MotionValue<number>) => ReactNode;
}) {
  const off = usePanelOffset(index, x, geoRef, geoTick);
  const near = (d: number) => Math.min(1, Math.abs(d) / geoRef.current.pitch);
  const dim = useTransform(off, (d) => 0.65 * near(d));
  const scale = useTransform(off, (d) => 1 - 0.06 * near(d));
  const shotX = useTransform(off, (d) => -32 * Math.max(-1, Math.min(1, d / geoRef.current.pitch)));

  return (
    <motion.div
      data-panel
      className={`shrink-0 h-full flex items-center justify-center will-change-transform ${PANEL_PAD}`}
      style={{ width: `calc(var(--card-w) + ${CARD_GAP}px)`, scale }}
    >
      <div className="relative" style={{ width: 'var(--card-w)', height: 'var(--card-h)' }}>
        {children(shotX)}
        {/* fades the card into the background without putting opacity on the card itself */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 rounded-3xl bg-ink-900 will-change-[opacity]"
        />
      </div>
    </motion.div>
  );
}

export function PathScene({
  onTravel,
  isActive,
  warm,
}: {
  onTravel: (travel: number) => void;
  isActive: boolean;
  /** the Path is near: fetch and decode the screenshots now so the first pass through is smooth */
  warm: boolean;
}) {
  const { t, tick, layoutRef, goToT, vw, cardW } = useStory();
  const trackRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<Geo>({ vw: 0, centers: [], railCenters: [], pitch: 1 });
  const activeRef = useRef(0);
  const startedRef = useRef(false);
  const endedRef = useRef(false);

  const [active, setActive] = useState(0);
  const maxX = useMotionValue(0);
  const geoTick = useMotionValue(0);

  // 0..1 along the strip itself, with the resting zones at both ends cut off
  const strip = useTransform([t, tick], ([tv]: number[]) => {
    const L = layoutRef.current;
    const s = L.starts[SCENE.path];
    const P = L.lens[SCENE.path];
    return clamp01((tv - s - DWELL * P) / ((1 - 2 * DWELL) * P));
  });
  const x = useTransform([strip, maxX], ([s, m]: number[]) => -s * m);

  const railFill = useTransform([x, geoTick], ([xv]: number[]) => {
    const cs = geoRef.current.railCenters;
    if (cs.length < 2) return 0;
    const cx = -xv + geoRef.current.vw / 2;
    if (cx <= cs[0]) return 0;
    for (let i = 0; i < cs.length - 1; i++) {
      if (cx <= cs[i + 1]) return (i + (cx - cs[i]) / (cs[i + 1] - cs[i])) / (cs.length - 1);
    }
    return 1;
  });

  // with the story's widths applied: where every panel really is and how far the strip travels
  useIsoLayoutEffect(() => {
    if (!vw) return;
    const track = trackRef.current;
    if (!track) return;
    const centers = [...track.children].map((el) => {
      const e = el as HTMLElement;
      return e.offsetLeft + e.offsetWidth / 2;
    });
    const travel = Math.max(0, track.scrollWidth - vw);
    geoRef.current = {
      vw,
      centers,
      railCenters: RAIL.map((r) => centers[r.child]),
      pitch: cardW + CARD_GAP,
    };
    maxX.set(travel);
    geoTick.set(geoTick.get() + 1);
    onTravel(travel);
  }, [vw, cardW, maxX, geoTick, onTravel]);

  useEffect(() => {
    if (!warm) return;
    trackRef.current?.querySelectorAll('img').forEach((img) => {
      img.loading = 'eager';
      img.decode().catch(() => {});
    });
  }, [warm]);

  // which rail panel is nearest the screen centre
  useMotionValueEvent(x, 'change', (xv) => {
    const cs = geoRef.current.railCenters;
    if (!cs.length) return;
    const cx = -xv + geoRef.current.vw / 2;
    let best = 0;
    let bd = Infinity;
    cs.forEach((c, i) => {
      const d = Math.abs(c - cx);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    activeRef.current = best;
    setActive((prev) => (prev === best ? prev : best));
  });

  // did they start it, did they reach the end
  useMotionValueEvent(strip, 'change', (s) => {
    if (!startedRef.current && s > 0.02) {
      startedRef.current = true;
      track('path_started');
    }
    if (!endedRef.current && s >= 0.98) {
      endedRef.current = true;
      track('path_reached_end');
    }
  });

  const goTo = useCallback(
    (ri: number, smooth = true) => {
      const g = geoRef.current;
      const c = g.railCenters[ri];
      const m = maxX.get();
      if (c === undefined || m <= 0) return;
      const s = clamp01((c - g.vw / 2) / m);
      const L = layoutRef.current;
      const P = L.lens[SCENE.path];
      goToT(L.starts[SCENE.path] + DWELL * P + s * (1 - 2 * DWELL) * P, smooth);
    },
    [goToT, layoutRef, maxX],
  );

  // ← / → step one panel while Path is the scene on screen
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const tg = e.target as HTMLElement | null;
      if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      const next = activeRef.current + (e.key === 'ArrowRight' ? 1 : -1);
      if (next < 0 || next > RAIL.length - 1) return;
      e.preventDefault();
      goTo(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive, goTo]);

  // Tabbing onto a link that is off-screen: bring the strip to it.
  const onFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const panel = (e.target as HTMLElement).closest('[data-panel]');
    if (!track || !panel) return;
    const child = Array.prototype.indexOf.call(track.children, panel);
    const ri = RAIL.findIndex((r) => r.child === child);
    if (ri >= 0 && (ri !== activeRef.current || !isActive)) goTo(ri, false);
  };

  return (
    <div className="absolute inset-0">
      <motion.div
        ref={trackRef}
        style={{ x }}
        onFocusCapture={onFocusCapture}
        className="flex h-full w-max will-change-transform"
      >
        <IntroPanel x={x} />
        {PATH_ITEMS.map((item, i) => (
          <CardPanel key={pathKey(item)} index={i + 1} x={x} geoRef={geoRef} geoTick={geoTick}>
            {(shotX) => <PathCard item={item} shotX={shotX} />}
          </CardPanel>
        ))}
        {/* lets the last card come to rest in the middle of the screen */}
        <div aria-hidden="true" className="shrink-0" style={{ width: 'calc((var(--vw) - var(--card-w)) / 2 - 20px)' }} />
      </motion.div>

      <nav aria-label="Path timeline" className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto w-full max-w-[1360px] px-8 pb-7 pt-2">
          <div className="relative h-9">
            <div className="absolute inset-x-0 top-[7px] h-px bg-white/10" />
            <motion.div
              style={{ scaleX: railFill }}
              className="absolute left-0 top-[7px] h-px w-full origin-left bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            />
            {RAIL.map((r, i) => (
              <button
                key={r.label}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${r.label}`}
                aria-current={i === active ? 'step' : undefined}
                style={{ left: `${(i / (RAIL.length - 1)) * 100}%` }}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-1.5"
              >
                <span
                  className={`block h-[15px] w-[15px] rounded-full border transition-all duration-300 ${
                    i <= active ? `${r.dot} border-white/30` : 'bg-ink-900 border-white/20'
                  } ${i === active ? 'scale-125 ring-4 ring-white/10' : ''}`}
                />
                <span
                  className={`whitespace-nowrap font-mono text-[10px] transition-colors duration-300 ${
                    i === active ? 'text-ink-100' : 'hidden xl:block text-ink-500'
                  }`}
                >
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
