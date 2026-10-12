'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { track } from '@vercel/analytics';
import { profile } from '@/lib/profile';
import { PathSnap } from './Timeline';
import { Story } from './Story';
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
import { Reveal, SectionShell, usePageProgress, usePinned } from './scrollfx';

/* =========================================================
   Top Nav (with a hairline that fills as the page is read)
   ========================================================= */
function PageProgress() {
  const progress = usePageProgress();
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: progress }}
      className="absolute left-0 right-0 -bottom-px h-[2px] origin-left bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
    />
  );
}

export function Nav({ onOpenTerminal }: { onOpenTerminal?: () => void }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Vienna',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between text-[11px] font-mono bg-ink-900/85 border-b border-white/[0.04]">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-ink-300 tracking-wider">AVAILABLE · FE / WERKSTUDENT · ST. PÖLTEN / VIENNA / REMOTE</span>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-ink-400">
        <span>St. Pölten {time}</span>
        <span className="text-ink-700">|</span>
        {onOpenTerminal && (
          <button
            onClick={onOpenTerminal}
            aria-label="Open terminal"
            title="Open terminal (press ` or ~)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 text-ink-300 hover:text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-500/[0.04] transition-all"
          >
            <span className="opacity-80">&gt;_</span>
            <span>terminal</span>
          </button>
        )}
        <a
          href="https://b1toks.github.io/cv/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('cv_clicked', { from: 'nav' })}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent hover:bg-accent-glow text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.45)]"
        >
          <span>↗</span> View CV
        </a>
      </div>
      <PageProgress />
    </nav>
  );
}

/* =========================================================
   Hero (3D hint text overlay)
   ========================================================= */
export function HeroOverlay() {
  const [roleIdx, setRoleIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setRoleIdx((i) => (i + 1) % profile.roles.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute top-20 md:top-24 left-4 md:left-8 right-4 md:right-8 pointer-events-none z-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-indigo-400/80 mb-3">
        00 / Portfolio
      </p>
      <h1 className="text-5xl md:text-7xl lg:text-[88px] font-bold leading-[0.95] tracking-[-0.02em]">
        Oleksandr
        <br />
        <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Honchar
        </span>
        <span className="text-indigo-400">.</span>
      </h1>
      <p className="mt-5 max-w-xl text-base md:text-lg text-ink-200 leading-snug">
        A Front-End Developer who thinks up ideas first — then builds them.
      </p>
      <div className="mt-3 h-5 text-[12px] md:text-[13px] text-ink-400 font-mono overflow-hidden">
        <span
          key={roleIdx}
          className="inline-block animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)]"
        >
          {profile.roles[roleIdx]}
        </span>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   3D Hint (floats under the canvas): the page below scrolls down.
   ========================================================= */
export function Hint() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-ink-400 px-4 text-center">
      <span className="opacity-80">drag to rotate · click a piece · scroll for more</span>
      <span className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center animate-bounce">
        ↓
      </span>
    </div>
  );
}

/* =========================================================
   The page as one vertical column: phone, tablet, short window and
   reduced motion. Each section keeps its title top-left and sticky
   while the content scrolls, giant words drift sideways behind it, and
   cards rise into place. The Path is a native scroll-snap list.
   ========================================================= */
function VerticalSections() {
  return (
    <>
      <SectionShell
        id="about"
        index="01"
        label="About"
        title={<>Where I&apos;m at — and where I&apos;m heading.</>}
        ghost="ABOUT"
      >
        <div className="grid grid-cols-6 auto-rows-[minmax(140px,auto)] gap-3 md:gap-4">
          <Reveal className="col-span-6 xl:col-span-4">
            <BioCard className="h-full p-8" />
          </Reveal>
          <Reveal className="col-span-6 xl:col-span-2" lane={1}>
            <LanguagesCard className="h-full p-6" />
          </Reveal>
          <SkillCards
            cardClassName="h-full p-6 relative overflow-hidden"
            wrap={(card, i) => (
              <Reveal className="col-span-6 md:col-span-3" lane={i % 2}>
                {card}
              </Reveal>
            )}
          />
          <Reveal className="col-span-6 md:col-span-3">
            <EducationCard className="h-full p-6" />
          </Reveal>
          <Reveal className="col-span-6 md:col-span-3" lane={1}>
            <StatsCard className="h-full p-6" />
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell
        id="background"
        index="02"
        label="Background"
        title="What shaped how I think about design and product."
        ghost="BACKGROUND"
        tone="text-ink-400"
        titleTone="text-ink-200"
      >
        <BackgroundGrid
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
          cardClassName="h-full p-6"
          wrap={(card, i) => <Reveal lane={i % 2}>{card}</Reveal>}
        />
      </SectionShell>

      <section id="path" aria-label="Career path" className="relative">
        <PathSnap />
      </section>

      <section className="relative px-4 md:px-8 pt-6 pb-10 md:pb-12 max-w-4xl mx-auto">
        <QuoteCard />
      </section>

      <section id="contact" className="relative">
        <div className="relative mx-auto max-w-5xl px-4 md:px-8 pt-10 pb-16 md:pb-24">
          <Reveal>
            <ContactCard className="p-8 relative overflow-hidden" />
          </Reveal>
          <TechFooter />
        </div>
      </section>
    </>
  );
}

/** Everything below the 3D hero: the pinned story on a roomy screen, the plain column otherwise. */
export function ContentSections() {
  const pinned = usePinned();
  return pinned ? <Story /> : <VerticalSections />;
}
