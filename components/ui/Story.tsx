'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from 'framer-motion';
import {
  BackgroundGrid,
  BioCard,
  ContactCard,
  EducationCard,
  LanguagesCard,
  QuoteCard,
  SkillCards,
  StatsCard,
  TechFooter,
} from './cards';
import { PathScene } from './PathStrip';
import { GHOST_TEXT, clamp01, refreshScrollValues, useIsoLayoutEffect, useScrollValue } from './scrollfx';
import {
  DWELL,
  PACE,
  SCENE,
  SCENE_COUNT,
  SECTION_SCENES,
  StoryCtx,
  computeLayout,
  useStory,
  type StoryApi,
} from './storyContext';

/* ============================================================
   Everything after the 3D hero is ONE pinned screen.

   Desktop: the story is as tall as all its scenes together, and a
   100vh stage is pinned (position: sticky) inside it. Scrolling moves
   a position `t` along the scenes; each scene fades in, rests, and
   fades out before the next one fades in, so exactly one is ever on
   screen: About, Stack, Profile, Background, Path (which turns the
   scroll sideways), Voices, Contact.

   Only `transform` and `opacity` animate. No backdrop-filter, no
   blend modes, and no opacity on large trees while a scene is at rest.

   Phone, short or narrow window, or prefers-reduced-motion: nothing is
   pinned and no scroll is hijacked; the page is the normal vertical
   column (see ContentSections in Sections.tsx).
   ============================================================ */

/* ---------- scene content ---------- */

/** Content area of a scene: right of the title column, centred in the room between nav and bottom edge. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center pt-[124px] pb-[56px]">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[260px_minmax(0,1fr)] gap-12 px-8">
        <div aria-hidden="true" />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

const AboutScene = () => (
  <Frame>
    <div className="grid grid-cols-6 gap-4">
      <BioCard className="col-span-4 p-7 min-[1500px]:p-9" bodyClassName="text-[15px] min-[1500px]:text-[17px]" />
      <LanguagesCard className="col-span-2 p-6" />
    </div>
  </Frame>
);

const StackScene = () => (
  <Frame>
    <div className="grid grid-cols-2 gap-4">
      <SkillCards cardClassName="h-full p-6 relative overflow-hidden" />
    </div>
  </Frame>
);

const ProfileScene = () => (
  <Frame>
    <div className="grid grid-cols-2 gap-4">
      <EducationCard className="h-full p-6" />
      <StatsCard className="h-full p-6" />
    </div>
  </Frame>
);

const BackgroundScene = () => (
  <Frame>
    <BackgroundGrid className="grid grid-cols-2 gap-4" cardClassName="h-full p-7" large />
  </Frame>
);

function VoicesScene() {
  const { t, tick, layoutRef } = useStory();
  // the words are all lit by ~70% of the scene, so the finished quote rests on screen before it fades
  const words = useTransform([t, tick], ([tv]: number[]) => {
    const L = layoutRef.current;
    const s = L.starts[SCENE.voices];
    const len = L.lens[SCENE.voices];
    return clamp01((tv - s - 0.12 * len) / (0.58 * len));
  });
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8">
      <div className="w-full max-w-4xl">
        <QuoteCard progress={words} />
      </div>
    </div>
  );
}

const ContactScene = () => (
  <div className="absolute inset-0 flex items-center justify-center px-8">
    <div className="w-full max-w-5xl">
      <ContactCard className="p-8 relative overflow-hidden" />
      <TechFooter className="mt-8" />
    </div>
  </div>
);

/* ---------- titles and giant words, one per section ---------- */

type Heading = {
  index: string;
  label: string;
  title: string;
  tone: string;
  titleTone: string;
  /** one short label per scene of the section, shown under the title */
  steps?: string[];
  /** single line, no fixed width (Path) */
  wide?: boolean;
};

const HEADINGS: (Heading | null)[] = [
  {
    index: '01',
    label: 'About',
    title: "Where I'm at — and where I'm heading.",
    tone: 'text-indigo-400/80',
    titleTone: 'text-ink-100',
    steps: ['Bio', 'Stack', 'Profile'],
  },
  {
    index: '02',
    label: 'Background',
    title: 'What shaped how I think about design and product.',
    tone: 'text-ink-400',
    titleTone: 'text-ink-200',
  },
  { index: '03', label: 'Path', title: 'The work, in order.', tone: 'text-pink-400/80', titleTone: 'text-ink-200', wide: true },
  null,
  null,
];

/** Giant faint word behind a section. The Path carries its own (it moves with the strip). */
const GHOSTS: (string | null)[] = ['ABOUT', 'BACKGROUND', null, 'VOICES', 'CONTACT'];

/* ---------- fading layers ---------- */

/**
 * Opacity / offset of a scene (kind 'scene') or of a section's title and word (kind 'section'),
 * from where `t` is along the scroll. Each one fades in at its start and out at its end; the
 * first rises into place as the story arrives, the last never fades out.
 */
function useLayerFade(kind: 'scene' | 'section', index: number) {
  const { t, tick, entry, layoutRef } = useStory();
  const first = index === 0;
  const last = index === (kind === 'scene' ? SCENE_COUNT : SECTION_SCENES.length) - 1;
  const range = () => {
    const L = layoutRef.current;
    return kind === 'scene'
      ? [L.starts[index], L.starts[index] + L.lens[index]]
      : [L.secStart[index], L.secEnd[index]];
  };
  const fin = useTransform([t, tick, entry], ([tv, , ev]: number[]) =>
    first ? ev : clamp01((tv - range()[0]) / layoutRef.current.fade),
  );
  const fout = useTransform([t, tick], ([tv]: number[]) =>
    last ? 1 : clamp01((range()[1] - tv) / layoutRef.current.fade),
  );
  const opacity = useTransform([fin, fout], ([a, b]: number[]) => a * b);
  const y = useTransform([fin, fout], ([a, b]: number[]) => (1 - a) * 28 - (1 - b) * 28);
  const events = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  return { opacity, y, events };
}

function SceneLayer({ index, children }: { index: number; children: ReactNode }) {
  const { opacity, y, events } = useLayerFade('scene', index);
  return (
    <motion.div
      data-scene={index}
      style={{ opacity, y, pointerEvents: events as MotionValue<'auto' | 'none'> }}
      className="absolute inset-0 will-change-[opacity,transform]"
    >
      {children}
    </motion.div>
  );
}

function HeadingLayer({ index, activeScene }: { index: number; activeScene: number }) {
  const { opacity, y } = useLayerFade('section', index);
  const h = HEADINGS[index];
  if (!h) return null;
  const sceneIdx = SECTION_SCENES[index].indexOf(activeScene);
  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-0 top-[76px] z-10 will-change-[opacity,transform]"
    >
      <div className="mx-auto max-w-[1360px] px-8">
        <div className={h.wide ? '' : 'w-[260px]'}>
          <p className={`font-mono text-[11px] uppercase tracking-[0.25em] mb-3 ${h.tone}`}>
            {h.index} / {h.label}
          </p>
          <h2 className={`text-3xl font-bold tracking-tight leading-[1.15] ${h.titleTone}`}>{h.title}</h2>
          {h.steps && (
            <ol className="mt-6 flex items-center gap-4 font-mono text-[11px]" aria-hidden="true">
              {h.steps.map((s, i) => (
                <li key={s} className={`flex items-center gap-1.5 transition-colors duration-300 ${i === sceneIdx ? 'text-ink-100' : 'text-ink-500'}`}>
                  <span className={`h-px transition-all duration-300 ${i === sceneIdx ? 'w-6 bg-gradient-to-r from-indigo-400 to-pink-400' : 'w-3 bg-white/20'}`} />
                  {s}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function GhostLayer({ index }: { index: number }) {
  const { t, tick, layoutRef } = useStory();
  const { opacity } = useLayerFade('section', index);
  const word = GHOSTS[index];
  // slides sideways as its section goes by
  const x = useTransform([t, tick], ([tv]: number[]) => {
    const L = layoutRef.current;
    const p = clamp01((tv - L.secStart[index]) / Math.max(1, L.secEnd[index] - L.secStart[index]));
    return `${10 - 26 * p}%`;
  });
  if (!word) return null;
  return (
    <motion.div style={{ opacity }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[16vh] will-change-[opacity]">
      <motion.span
        style={{ x }}
        className={`block select-none whitespace-nowrap font-black leading-none will-change-transform ${GHOST_TEXT} ${
          word.length > 8 ? 'text-[12vw]' : 'text-[17vw]'
        }`}
      >
        {word}
      </motion.span>
    </motion.div>
  );
}

/* ---------- the story ---------- */

export function Story() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  const [dims, setDims] = useState({ vw: 0, vh: 0 });
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);

  // how long the Path scene is: the strip's travel, stretched by the resting zones and sped up by PACE
  const pathLen = travel / (PACE * (1 - 2 * DWELL));
  const layout = useMemo(() => computeLayout(dims.vh || 900, pathLen), [dims.vh, pathLen]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const tick = useMotionValue(0);
  useIsoLayoutEffect(() => {
    tick.set(tick.get() + 1);
    refreshScrollValues(); // the page just got a new height: everything that measures it must re-read
  }, [layout, tick]);

  // px scrolled into the pinned story, eased so single wheel notches glide
  const raw = useScrollValue(outerRef, (r, vh) => Math.max(0, Math.min(r.height - vh, -r.top)));
  const entry = useScrollValue(outerRef, (r, vh) => clamp01((vh * 0.92 - r.top) / (vh * 0.6)));
  const t = useSpring(raw, { stiffness: 260, damping: 38, mass: 0.4, restDelta: 0.3 });
  useIsoLayoutEffect(() => {
    t.jump(raw.get()); // arriving mid-page (reload): start there, don't glide from the top
  }, [t, raw]);

  // viewport size
  useIsoLayoutEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const measure = () => {
      const vw = sticky.clientWidth;
      const vh = sticky.clientHeight;
      setDims((d) => (d.vw === vw && d.vh === vh ? d : { vw, vh }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(sticky);
    return () => ro.disconnect();
  }, []);

  const cardW = Math.min(dims.vw * 0.82, 980);

  const goToT = useCallback((px: number, smooth = true) => {
    const outer = outerRef.current;
    if (!outer) return;
    const top = outer.getBoundingClientRect().top + window.scrollY + px;
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const onTravel = useCallback((px: number) => setTravel((prev) => (Math.abs(prev - px) < 0.5 ? prev : px)), []);

  // which scene is on screen
  useMotionValueEvent(t, 'change', (tv) => {
    const L = layoutRef.current;
    let idx = 0;
    for (let i = 0; i < SCENE_COUNT; i++) if (tv >= L.starts[i]) idx = i;
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
    }
  });

  // A sideways trackpad swipe has nowhere to go on a page that scrolls down: during the Path, feed it to the strip.
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky || active !== SCENE.path) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaX / PACE });
    };
    sticky.addEventListener('wheel', onWheel, { passive: false });
    return () => sticky.removeEventListener('wheel', onWheel);
  }, [active]);

  // Tabbing onto something in a scene that is not on screen: bring that scene in.
  const onFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest('[data-scene]') as HTMLElement | null;
    if (!el) return;
    const i = Number(el.dataset.scene);
    if (i === SCENE.path || i === activeRef.current) return; // the Path steers itself
    const L = layoutRef.current;
    goToT(L.starts[i] + L.lens[i] * 0.5, false);
  };

  const api: StoryApi = useMemo(
    () => ({ t, tick, entry, layoutRef, goToT, vw: dims.vw, cardW }),
    [t, tick, entry, goToT, dims.vw, cardW],
  );

  const vars = {
    '--vw': dims.vw ? `${dims.vw}px` : '100vw',
    '--card-w': dims.vw ? `${cardW}px` : 'min(82vw, 980px)',
    '--card-h': 'clamp(380px, calc(100svh - 260px), 560px)',
  } as CSSProperties;

  return (
    <StoryCtx.Provider value={api}>
      <div ref={outerRef} className="relative" style={{ height: `calc(100svh + ${layout.total}px)` }}>
        <div
          ref={stickyRef}
          style={vars}
          onFocusCapture={onFocusCapture}
          className="sticky top-0 h-[100svh] overflow-clip"
        >
          {GHOSTS.map((_, i) => (
            <GhostLayer key={i} index={i} />
          ))}
          {HEADINGS.map((_, i) => (
            <HeadingLayer key={i} index={i} activeScene={active} />
          ))}

          <SceneLayer index={SCENE.about}>
            <AboutScene />
          </SceneLayer>
          <SceneLayer index={SCENE.stack}>
            <StackScene />
          </SceneLayer>
          <SceneLayer index={SCENE.profile}>
            <ProfileScene />
          </SceneLayer>
          <SceneLayer index={SCENE.background}>
            <BackgroundScene />
          </SceneLayer>
          <SceneLayer index={SCENE.path}>
            <PathScene onTravel={onTravel} isActive={active === SCENE.path} warm={active >= SCENE.profile} />
          </SceneLayer>
          <SceneLayer index={SCENE.voices}>
            <VoicesScene />
          </SceneLayer>
          <SceneLayer index={SCENE.contact}>
            <ContactScene />
          </SceneLayer>
        </div>
      </div>
    </StoryCtx.Provider>
  );
}
