'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { track } from '@vercel/analytics';
import { timelineEvents, type TimelineEvent, type TimelineColor } from '@/lib/timeline';
import { SUBUTAI_URL, SUBUTAI_REPO_URL } from '@/lib/links';
import { ArrowCue } from './scrollfx';

/* ============================================================
   Path — career events as cards, then one closing panel that leads
   to the live product.

   The cards are shared: PathStrip.tsx lays them out on the pinned
   sideways stage (desktop); PathSnap below is the phone / short window /
   reduced-motion version: a native horizontal scroll-snap list that
   hijacks nothing.
   ============================================================ */

export type PathItem = { kind: 'event'; event: TimelineEvent } | { kind: 'finale' };

/** Every career event, then the finale. */
export const PATH_ITEMS: PathItem[] = [
  ...timelineEvents.map((event): PathItem => ({ kind: 'event', event })),
  { kind: 'finale' },
];

export const pathKey = (item: PathItem) => (item.kind === 'event' ? item.event.id : 'finale');
export const pathShort = (item: PathItem) => (item.kind === 'event' ? item.event.short : 'Live');

/* ============================================================
   Screenshot frame — image with graceful fallback to placeholder
   ============================================================ */
function ScreenshotFrame({
  src,
  alt,
  caption,
  eventId,
  aspect = 'aspect-video',
  className = 'mt-4',
}: {
  src: string;
  alt: string;
  caption?: string;
  eventId: string;
  aspect?: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={`${className} ${aspect} rounded-lg bg-gradient-to-br from-ink-800 to-ink-900 border border-dashed border-white/[0.08] flex items-center justify-center`}>
        <div className="text-center px-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-500">
            Screenshot placeholder
          </p>
          <p className="text-[10px] text-ink-600 mt-1.5 font-mono">
            drop image into <code className="text-ink-400">/public{src}</code>
          </p>
          <p className="text-[10px] text-ink-700 mt-1 font-mono">id: {eventId}</p>
        </div>
      </div>
    );
  }

  return (
    <figure className={className}>
      <div className={`${aspect} rounded-lg overflow-hidden border border-white/[0.08] bg-ink-900`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-[11.5px] text-ink-300 leading-snug italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ============================================================
   Color tokens — Tailwind needs static class strings, so we
   declare the full set per accent here.
   ============================================================ */
const COLORS: Record<TimelineColor, {
  dot: string;
  role: string;
  tagBg: string;
  hoverBorder: string;
  hoverShadow: string;
  /** Live-link pill-button — strong contrast, branded glow on hover */
  link: string;
}> = {
  indigo: {
    dot: 'bg-indigo-500',
    role: 'text-indigo-300/80',
    tagBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    hoverBorder: 'group-hover/tl:border-indigo-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(99,102,241,0.45)]',
    link: 'bg-indigo-500/15 text-indigo-100 border-indigo-400/40 hover:bg-indigo-500/30 hover:border-indigo-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(99,102,241,0.55)]',
  },
  purple: {
    dot: 'bg-purple-500',
    role: 'text-purple-300/80',
    tagBg: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    hoverBorder: 'group-hover/tl:border-purple-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(168,85,247,0.45)]',
    link: 'bg-purple-500/15 text-purple-100 border-purple-400/40 hover:bg-purple-500/30 hover:border-purple-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(168,85,247,0.55)]',
  },
  cyan: {
    dot: 'bg-cyan-500',
    role: 'text-cyan-300/80',
    tagBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    hoverBorder: 'group-hover/tl:border-cyan-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(34,211,238,0.4)]',
    link: 'bg-cyan-500/15 text-cyan-100 border-cyan-400/40 hover:bg-cyan-500/30 hover:border-cyan-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(34,211,238,0.55)]',
  },
  pink: {
    dot: 'bg-pink-500',
    role: 'text-pink-300/80',
    tagBg: 'bg-pink-500/10 text-pink-300 border-pink-500/25',
    hoverBorder: 'group-hover/tl:border-pink-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(236,72,153,0.4)]',
    link: 'bg-pink-500/15 text-pink-100 border-pink-400/40 hover:bg-pink-500/30 hover:border-pink-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(236,72,153,0.55)]',
  },
  emerald: {
    dot: 'bg-emerald-500',
    role: 'text-emerald-300/80',
    tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    hoverBorder: 'group-hover/tl:border-emerald-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(16,185,129,0.4)]',
    link: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(16,185,129,0.55)]',
  },
  amber: {
    dot: 'bg-amber-500',
    role: 'text-amber-300/80',
    tagBg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    hoverBorder: 'group-hover/tl:border-amber-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(245,158,11,0.4)]',
    link: 'bg-amber-500/15 text-amber-100 border-amber-400/40 hover:bg-amber-500/30 hover:border-amber-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(245,158,11,0.55)]',
  },
};

/** Colour of the dot for this item on a progress rail. */
export const pathDot = (item: PathItem) =>
  COLORS[item.kind === 'event' ? item.event.color : 'indigo'].dot;

/* ============================================================
   Cards
   ============================================================ */
export function EventCard({ event, shotX }: { event: TimelineEvent; shotX?: MotionValue<number> }) {
  const c = COLORS[event.color];

  return (
    <article
      className={`path-card group/tl relative h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-ink-700/60 via-ink-800/40 to-ink-900/70 p-6 md:p-8 grid content-start md:content-center gap-6 md:gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-center transition-[border-color,box-shadow] duration-500 ${c.hoverBorder} ${c.hoverShadow}`}
    >
      <div className="min-w-0">
        {/* date + tag header */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-mono text-[11px] text-ink-300 tracking-wider">
            {event.date}
            {event.dateEnd && <span className="text-ink-500"> — {event.dateEnd}</span>}
          </span>
          {event.tag && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${c.tagBg} border whitespace-nowrap`}>
              {event.tag}
            </span>
          )}
          {event.program && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25 whitespace-nowrap">
              ✦ {event.program}
            </span>
          )}
        </div>

        <h3 className="text-xl md:text-2xl font-semibold text-ink-100 tracking-tight leading-tight">
          {event.title}
        </h3>

        <p className={`mt-1 text-[11.5px] font-mono ${c.role} tracking-wider`}>{event.role}</p>

        <p className="mt-3 text-[13.5px] text-ink-300 leading-relaxed">{event.description}</p>

        {event.stack && event.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {event.stack.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/10 text-ink-300"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {event.links && event.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {event.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('project_link_clicked', { project: event.title, label: l.label })}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[12px] font-mono font-medium transition-all duration-300 ${c.link}`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
                <span>{l.label}</span>
                <span className="text-[11px] opacity-80 transition-transform group-hover/tl:translate-x-0.5">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* screenshot drifts against the strip (parallax) when the strip passes a value in */}
      <motion.div style={shotX ? { x: shotX } : undefined} className="min-w-0">
        {event.screenshot && (
          <ScreenshotFrame
            src={event.screenshot}
            alt={`${event.title} screenshot`}
            caption={event.screenshotCaption}
            eventId={event.id}
            aspect={event.screenshotAspect}
            className="mt-0"
          />
        )}
      </motion.div>
    </article>
  );
}

/** Last panel of the path: it ends at the live product. */
export function FinaleCard() {
  return (
    <article className="relative h-full min-h-[340px] overflow-hidden rounded-3xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/[0.14] via-purple-500/[0.07] to-ink-900/80 p-8 md:p-12 flex flex-col justify-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-indigo-300/80 mb-4">
        Now live
      </p>
      <h3 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-ink-100">
        Subutai is live.
        <br />
        <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Rotate the board yourself.
        </span>
      </h3>
      <p className="mt-5 max-w-md text-[15px] text-ink-300 leading-relaxed">
        Shown at Lucid Dreams 2026: ~120 visitors, ~80 sat down and played. It runs in the browser.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={SUBUTAI_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('project_link_clicked', { project: 'Subutai', label: 'Path finale · Play' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-glow text-white text-sm font-medium transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
        >
          Play Subutai <span aria-hidden="true">↗</span>
        </a>
        <a
          href={SUBUTAI_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('project_link_clicked', { project: 'Subutai', label: 'Path finale · Source' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:border-white/25"
        >
          ◉ Source on GitHub
        </a>
      </div>
    </article>
  );
}

export function PathCard({ item, shotX }: { item: PathItem; shotX?: MotionValue<number> }) {
  return item.kind === 'event' ? <EventCard event={item.event} shotX={shotX} /> : <FinaleCard />;
}

/** "03 / Path" title block of the scroll-snap list. */
export function PathHeading({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-pink-400/80 mb-3">
        03 / Path
      </p>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight max-w-3xl text-ink-200">
        The work, in order.
      </h2>
    </div>
  );
}

/* ============================================================
   Native horizontal scroll-snap (phone, short window, reduced
   motion). No scroll is hijacked.
   ============================================================ */
export function PathSnap() {
  const listRef = useRef<HTMLOListElement>(null);
  const endTracked = useRef(false);

  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || endTracked.current) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      endTracked.current = true;
      track('path_reached_end');
    }
  }, []);

  return (
    <div className="pt-10 pb-10 md:pb-12">
      <PathHeading className="px-4 md:px-8 max-w-6xl mx-auto mb-8" />
      <ol
        ref={listRef}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Career path, scroll sideways"
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-4 md:scroll-px-8 px-4 md:px-8 pb-4"
      >
        {PATH_ITEMS.map((item) => (
          <li key={pathKey(item)} className="snap-center shrink-0 w-[86vw] md:w-[min(80vw,900px)]">
            <PathCard item={item} />
          </li>
        ))}
      </ol>
      <div className="mt-3 px-4 md:px-8 max-w-6xl mx-auto flex items-center gap-4 font-mono text-[11px] text-ink-400">
        <span>Swipe sideways</span>
        <ArrowCue className="h-auto w-24" />
      </div>
    </div>
  );
}
