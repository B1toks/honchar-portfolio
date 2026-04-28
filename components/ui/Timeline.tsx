'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { timelineEvents, type TimelineEvent, type TimelineColor } from '@/lib/timeline';

/* ============================================================
   Screenshot frame — image with graceful fallback to placeholder
   ============================================================ */
function ScreenshotFrame({
  src,
  alt,
  caption,
  eventId,
  aspect = 'aspect-video',
}: {
  src: string;
  alt: string;
  caption?: string;
  eventId: string;
  aspect?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className={`mt-4 ${aspect} rounded-lg bg-gradient-to-br from-ink-800 to-ink-900 border border-dashed border-white/[0.08] flex items-center justify-center`}>
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
    <figure className="mt-4">
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
  ring: string;
  pingBg: string;
  role: string;
  tagBg: string;
  hoverBorder: string;
  hoverShadow: string;
  /** Live-link pill-button — strong contrast, branded glow on hover */
  link: string;
}> = {
  indigo: {
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500/25',
    pingBg: 'bg-indigo-400',
    role: 'text-indigo-300/80',
    tagBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    hoverBorder: 'group-hover/tl:border-indigo-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(99,102,241,0.45)]',
    link: 'bg-indigo-500/15 text-indigo-100 border-indigo-400/40 hover:bg-indigo-500/30 hover:border-indigo-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(99,102,241,0.55)]',
  },
  purple: {
    dot: 'bg-purple-500',
    ring: 'ring-purple-500/25',
    pingBg: 'bg-purple-400',
    role: 'text-purple-300/80',
    tagBg: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    hoverBorder: 'group-hover/tl:border-purple-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(168,85,247,0.45)]',
    link: 'bg-purple-500/15 text-purple-100 border-purple-400/40 hover:bg-purple-500/30 hover:border-purple-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(168,85,247,0.55)]',
  },
  cyan: {
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-500/25',
    pingBg: 'bg-cyan-400',
    role: 'text-cyan-300/80',
    tagBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    hoverBorder: 'group-hover/tl:border-cyan-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(34,211,238,0.4)]',
    link: 'bg-cyan-500/15 text-cyan-100 border-cyan-400/40 hover:bg-cyan-500/30 hover:border-cyan-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(34,211,238,0.55)]',
  },
  pink: {
    dot: 'bg-pink-500',
    ring: 'ring-pink-500/25',
    pingBg: 'bg-pink-400',
    role: 'text-pink-300/80',
    tagBg: 'bg-pink-500/10 text-pink-300 border-pink-500/25',
    hoverBorder: 'group-hover/tl:border-pink-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(236,72,153,0.4)]',
    link: 'bg-pink-500/15 text-pink-100 border-pink-400/40 hover:bg-pink-500/30 hover:border-pink-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(236,72,153,0.55)]',
  },
  emerald: {
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/25',
    pingBg: 'bg-emerald-400',
    role: 'text-emerald-300/80',
    tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    hoverBorder: 'group-hover/tl:border-emerald-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(16,185,129,0.4)]',
    link: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30 hover:border-emerald-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(16,185,129,0.55)]',
  },
  amber: {
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/25',
    pingBg: 'bg-amber-400',
    role: 'text-amber-300/80',
    tagBg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    hoverBorder: 'group-hover/tl:border-amber-400/40',
    hoverShadow: 'group-hover/tl:shadow-[0_0_50px_-15px_rgba(245,158,11,0.4)]',
    link: 'bg-amber-500/15 text-amber-100 border-amber-400/40 hover:bg-amber-500/30 hover:border-amber-300/70 hover:text-white hover:shadow-[0_0_22px_-2px_rgba(245,158,11,0.55)]',
  },
};

/* ============================================================
   Timeline (vertical, single-rail, dark theme)
   ============================================================ */
export function Timeline() {
  return (
    <div className="relative">
      {/* vertical rail */}
      <div
        className="absolute left-[15px] md:left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-500/0 via-white/15 to-indigo-500/0"
        aria-hidden="true"
      />

      <ol className="space-y-6 md:space-y-8">
        {timelineEvents.map((event, idx) => (
          <TimelineItem key={event.id} event={event} index={idx} />
        ))}
      </ol>
    </div>
  );
}

/* ============================================================
   Single timeline item — dot on the rail + card with details
   ============================================================ */
function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const c = COLORS[event.color];

  return (
    <motion.li
      className="relative pl-10 md:pl-14 group/tl"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.4) }}
    >
      {/* dot on the rail */}
      <span
        className={`absolute left-[7px] md:left-[11px] top-[18px] w-4 h-4 rounded-full ${c.dot} ring-4 ${c.ring} transition-all duration-300 group-hover/tl:scale-125 group-hover/tl:ring-8 z-10`}
        aria-hidden="true"
      >
        {/* subtle ping on hover */}
        <span className={`absolute inset-0 rounded-full ${c.pingBg} opacity-0 group-hover/tl:opacity-30 group-hover/tl:animate-ping`} />
      </span>

      {/* card */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-ink-700/60 via-ink-800/40 to-ink-900/60 backdrop-blur-sm p-5 md:p-6 transition-all duration-500 ${c.hoverBorder} ${c.hoverShadow}`}
      >
        {/* subtle noise overlay (matches existing bento style) */}
        <div className="noise absolute inset-0 pointer-events-none" />

        <div className="relative">
          {/* date + tag header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-mono text-[11px] text-ink-300 tracking-wider">
              {event.date}
              {event.dateEnd && <span className="text-ink-500"> — {event.dateEnd}</span>}
            </span>
            {event.tag && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${c.tagBg} border whitespace-nowrap`}
              >
                {event.tag}
              </span>
            )}
            {event.program && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25 whitespace-nowrap">
                ✦ {event.program}
              </span>
            )}
          </div>

          {/* title */}
          <h3 className="text-xl md:text-[22px] font-semibold text-ink-100 tracking-tight leading-tight">
            {event.title}
          </h3>

          {/* role */}
          <p className={`mt-1 text-[11.5px] font-mono ${c.role} tracking-wider`}>
            {event.role}
          </p>

          {/* description */}
          <p className="mt-3 text-[13.5px] text-ink-300 leading-relaxed">
            {event.description}
          </p>

          {/* stack */}
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

          {/* screenshot — falls back to placeholder if image 404s */}
          {event.screenshot && (
            <ScreenshotFrame
              src={event.screenshot}
              alt={`${event.title} screenshot`}
              caption={event.screenshotCaption}
              eventId={event.id}
              aspect={event.screenshotAspect}
            />
          )}

          {/* external links — one or more pill buttons in event accent color */}
          {event.links && event.links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {event.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
      </div>
    </motion.li>
  );
}
