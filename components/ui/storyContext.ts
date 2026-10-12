'use client';

import { createContext, useContext } from 'react';
import type { MotionValue } from 'framer-motion';

/* ============================================================
   Shared by the pinned story (Story.tsx) and the Path scene inside it.
   ============================================================ */

/** Share of the Path scene at each end where the strip rests. */
export const DWELL = 0.03;
/** How much faster the strip moves sideways than the page scrolls down. */
export const PACE = 1.15;
/** Gap between Path cards, px — also the card pitch minus the card width. */
export const CARD_GAP = 40;
/** Length of a scene's fade at each end, in screen heights of scroll. */
export const FADE = 0.12;

/** Scene order. The index is what `Layout` arrays are keyed by. */
export const SCENE = {
  about: 0,
  stack: 1,
  profile: 2,
  background: 3,
  path: 4,
  voices: 5,
  contact: 6,
} as const;
export const SCENE_COUNT = 7;

/** A section is one or more scenes that share a title and a giant word. */
export const SECTION_SCENES: readonly (readonly number[])[] = [
  [SCENE.about, SCENE.stack, SCENE.profile], // About
  [SCENE.background], // Background
  [SCENE.path], // Path
  [SCENE.voices], // Voices
  [SCENE.contact], // Contact
];

/** Where every scene sits along the pinned scroll, in px. */
export type Layout = {
  vh: number;
  fade: number;
  starts: number[];
  lens: number[];
  secStart: number[];
  secEnd: number[];
  total: number;
};

export function computeLayout(vh: number, pathLen: number): Layout {
  const lens: number[] = [];
  lens[SCENE.about] = 0.85 * vh;
  lens[SCENE.stack] = 0.85 * vh;
  lens[SCENE.profile] = 0.85 * vh;
  lens[SCENE.background] = 0.85 * vh;
  lens[SCENE.path] = Math.max(pathLen, vh);
  lens[SCENE.voices] = 1.5 * vh;
  lens[SCENE.contact] = 1.0 * vh;

  const starts: number[] = [];
  let acc = 0;
  for (let i = 0; i < SCENE_COUNT; i++) {
    starts[i] = acc;
    acc += lens[i];
  }
  const secStart = SECTION_SCENES.map((s) => starts[s[0]]);
  const secEnd = SECTION_SCENES.map((s) => starts[s[s.length - 1]] + lens[s[s.length - 1]]);
  return { vh, fade: FADE * vh, starts, lens, secStart, secEnd, total: acc };
}

export type StoryApi = {
  /** px scrolled inside the pinned story (smoothed) */
  t: MotionValue<number>;
  /** bumps whenever the layout changes, so derived values recompute */
  tick: MotionValue<number>;
  /** 0..1 while the story is rising into place after the hero */
  entry: MotionValue<number>;
  layoutRef: { current: Layout };
  /** scroll the page so the story is `px` in */
  goToT: (px: number, smooth?: boolean) => void;
  vw: number;
  cardW: number;
};

export const StoryCtx = createContext<StoryApi | null>(null);

export function useStory() {
  const ctx = useContext(StoryCtx);
  if (!ctx) throw new Error('useStory outside <Story>');
  return ctx;
}
