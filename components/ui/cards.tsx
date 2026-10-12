'use client';

import { Fragment } from 'react';
import type { MotionValue } from 'framer-motion';
import { track } from '@vercel/analytics';
import { profile } from '@/lib/profile';
import { ScrubWords } from './scrollfx';

/* =========================================================
   Content cards. Callers pass the layout classes (padding, height);
   grid placement goes on a wrapper (see `wrap`) so a scroll effect
   can move the wrapper without fighting the card's own hover transform.
   ========================================================= */

type Glow = 'indigo' | 'purple' | 'cyan' | 'pink' | 'emerald' | 'amber';

export function Bento({
  children,
  className = '',
  glow = 'indigo',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: Glow;
  variant?: 'default' | 'archive';
}) {
  const glowMap: Record<string, string> = {
    indigo:  'hover:border-indigo-400/30 hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.45)]',
    purple:  'hover:border-purple-400/30 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.45)]',
    cyan:    'hover:border-cyan-400/30 hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.4)]',
    pink:    'hover:border-pink-400/30 hover:shadow-[0_0_60px_-15px_rgba(236,72,153,0.4)]',
    emerald: 'hover:border-emerald-400/30 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]',
    amber:   'hover:border-amber-400/30 hover:shadow-[0_0_60px_-15px_rgba(245,158,11,0.4)]',
  };
  // archive variant = lighter background + dashed border, signals "context/history" not "active feature"
  const baseBg =
    variant === 'archive'
      ? 'bg-gradient-to-br from-ink-700/30 via-ink-800/20 to-ink-900/40'
      : 'bg-gradient-to-br from-ink-700/80 via-ink-800/60 to-ink-900';
  const baseBorder =
    variant === 'archive'
      ? 'border border-dashed border-white/[0.1]'
      : 'border border-white/[0.06]';
  return (
    <div
      className={`bento group relative overflow-hidden rounded-[24px] ${baseBorder} ${baseBg} transition-all duration-500 ${glowMap[glow]} ${className}`}
    >
      <div className="noise absolute inset-0" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/* ---------- About ---------- */

export function BioCard({ className = '', bodyClassName = 'text-base md:text-[17px]' }: { className?: string; bodyClassName?: string }) {
  return (
    <Bento className={className} glow="indigo">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-indigo-400/80 mb-4">Bio</p>
      <div className={`space-y-3 ${bodyClassName} text-ink-300 leading-relaxed`}>
        <p>
          <span className="text-ink-100">Front-End Developer</span> based in Sankt Pölten,
          currently on <span className="text-ink-100">Erasmus+</span> at FH St. Pölten.
          Stack: <span className="text-ink-100">React, TypeScript, Next.js, Tailwind</span> —
          expanding into <span className="text-ink-100">full-stack with Node/Express</span> in
          active development. I take concepts to ship — built it as a player,
          not just a developer.
        </p>
        <p>
          Before code, <span className="text-ink-100">visual design</span> —
          Photoshop, Illustrator, freelance commissions. That&apos;s why I care
          how interfaces <em className="text-ink-100 not-italic font-medium">feel</em>,
          not just how they function.
        </p>
        <p>
          Technical lead on <span className="text-ink-100">Subutai</span> — a kinetic
          chess installation co-created with Viktor Schetinger, exhibited at
          <span className="text-ink-100"> Lucid Dreams 2026</span> (~120 visitors,
          ~80 played it live). Builder first today, creative technologist later.
        </p>
      </div>
    </Bento>
  );
}

export function LanguagesCard({ className = '' }: { className?: string }) {
  return (
    <Bento className={className} glow="cyan">
      <div className="flex flex-col h-full">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 mb-4">
          Languages
        </p>
        <div className="space-y-3">
          {profile.languages.map((l) => (
            <div key={l.name}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-ink-100">{l.name}</span>
                <span className="text-ink-400 font-mono text-[10px]">{l.level}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-700"
                  style={{ width: `${l.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Up next — pushed to bottom to balance with the taller About bento */}
        <div className="mt-auto pt-5 border-t border-white/[0.05] space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 mb-2">
              Up next
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/10 text-ink-300">
                DE A1
              </span>
              <span className="text-cyan-400/70 text-[10px]">→</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/[0.12] border border-cyan-400/30 text-cyan-200 font-medium">
                A2
              </span>
              <span className="text-[10px] text-ink-500">by Jul 2026</span>
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5">
              Working comfort
            </p>
            <p className="text-[11px] text-ink-400 leading-relaxed">
              EN for any tech context — meetings, code reviews, docs.
              Building DE for long-term life in Austria.
            </p>
          </div>
        </div>
      </div>
    </Bento>
  );
}

/* ---------- Stack: 4 skill cards with a featured primary tech + category tint ---------- */

const SKILL_GROUPS = [
  {
    key: 'Languages & Frameworks',
    num: '01',
    icon: '⟨⟩',
    glow: 'indigo',
    labelText: 'text-indigo-300/80',
    featuredGrad: 'from-indigo-500/35 via-indigo-500/15 to-transparent',
    featuredBorder: 'border-indigo-400/40',
    featuredText: 'text-indigo-100',
    tagBg: 'bg-indigo-500/[0.08]',
    tagText: 'text-indigo-200',
    tagBorder: 'border-indigo-500/20',
    tagHover: 'hover:border-indigo-400/60 hover:bg-indigo-500/20 hover:text-indigo-100',
  },
  {
    key: 'Tools & Libraries',
    num: '02',
    icon: '◈',
    glow: 'purple',
    labelText: 'text-purple-300/80',
    featuredGrad: 'from-purple-500/35 via-purple-500/15 to-transparent',
    featuredBorder: 'border-purple-400/40',
    featuredText: 'text-purple-100',
    tagBg: 'bg-purple-500/[0.08]',
    tagText: 'text-purple-200',
    tagBorder: 'border-purple-500/20',
    tagHover: 'hover:border-purple-400/60 hover:bg-purple-500/20 hover:text-purple-100',
  },
  {
    key: 'Platforms',
    num: '03',
    icon: '▲',
    glow: 'cyan',
    labelText: 'text-cyan-300/80',
    featuredGrad: 'from-cyan-500/35 via-cyan-500/15 to-transparent',
    featuredBorder: 'border-cyan-400/40',
    featuredText: 'text-cyan-100',
    tagBg: 'bg-cyan-500/[0.08]',
    tagText: 'text-cyan-200',
    tagBorder: 'border-cyan-500/20',
    tagHover: 'hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-cyan-100',
  },
  {
    key: 'Workflow',
    num: '04',
    icon: '⚡',
    glow: 'amber',
    labelText: 'text-amber-300/80',
    featuredGrad: 'from-amber-500/35 via-amber-500/15 to-transparent',
    featuredBorder: 'border-amber-400/40',
    featuredText: 'text-amber-100',
    tagBg: 'bg-amber-500/[0.08]',
    tagText: 'text-amber-200',
    tagBorder: 'border-amber-500/20',
    tagHover: 'hover:border-amber-400/60 hover:bg-amber-500/20 hover:text-amber-100',
  },
] as const;

/** Wraps one card of a list; lets the caller put each card in its own grid cell (scroll reveal). */
type Wrap = (card: React.ReactNode, index: number) => React.ReactNode;

/** Four cards, returned as a fragment so they drop straight into the caller's grid. */
export function SkillCards({ cardClassName, wrap }: { cardClassName: string; wrap?: Wrap }) {
  return (
    <>
      {SKILL_GROUPS.map((g, gi) => {
        const list = profile.skills[g.key as keyof typeof profile.skills] ?? [];
        const [featured, ...rest] = list;
        const card = (
          <Bento className={cardClassName} glow={g.glow}>
            {/* huge decorative number */}
            <span
              className="absolute -top-4 -right-2 text-[120px] leading-none font-black opacity-[0.04] select-none pointer-events-none tracking-tighter"
              aria-hidden="true"
            >
              {g.num}
            </span>

            {/* header row */}
            <div className="flex items-center justify-between mb-4 relative">
              <p className={`font-mono text-[10px] uppercase tracking-[0.25em] ${g.labelText} flex items-center gap-2`}>
                <span className="text-sm font-normal opacity-70">{g.icon}</span>
                <span>{g.num} · {g.key}</span>
              </p>
              <span className="text-[10px] font-mono text-ink-500 tabular-nums">
                {list.length} tech
              </span>
            </div>

            {/* featured primary tech */}
            {featured && (
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-2 mb-3 rounded-lg bg-gradient-to-br ${g.featuredGrad} border ${g.featuredBorder} text-[13px] font-semibold ${g.featuredText}`}
              >
                <span className="text-[10px] opacity-70">★</span>
                {featured}
              </div>
            )}

            {/* remaining tags */}
            <div className="flex flex-wrap gap-1.5">
              {rest.map((s) => (
                <span
                  key={s}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono ${g.tagBg} ${g.tagText} border ${g.tagBorder} ${g.tagHover} hover:scale-[1.04] transition-all duration-200 cursor-default`}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* subtle bottom line — like a card footer */}
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] font-mono text-ink-500 tracking-wider uppercase">
                {g.key === 'Workflow' ? 'methods' :
                 g.key === 'Platforms' ? 'deploy' :
                 g.key === 'Tools & Libraries' ? 'daily driver' : 'core stack'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${g.tagBg.replace('/[0.08]', '/60')} animate-pulse`} />
            </div>
          </Bento>
        );
        return <Fragment key={g.key}>{wrap ? wrap(card, gi) : card}</Fragment>;
      })}
    </>
  );
}

/* ---------- Profile: education + numbers ---------- */

export function EducationCard({ className = '' }: { className?: string }) {
  return (
    <Bento className={className} glow="purple">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-purple-400/80 mb-3">
        Education
      </p>
      <div className="space-y-3">
        {profile.education.map((e) => (
          <div key={e.degree}>
            <h4 className="text-sm font-semibold text-ink-100">{e.degree}</h4>
            <p className="text-[12px] text-ink-300">{e.school}</p>
            <p className="text-[11px] font-mono text-ink-400 mt-0.5">{e.period}</p>
          </div>
        ))}
      </div>
    </Bento>
  );
}

export function StatsCard({ className = '' }: { className?: string }) {
  return (
    <Bento className={className} glow="indigo">
      <div className="flex flex-col h-full">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-indigo-400/80">
          Shipped, measured
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-4">
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent leading-none">
              84
            </p>
            <p className="text-[10px] font-mono text-ink-500 mt-1.5 uppercase tracking-wider">
              Lighthouse Perf · this site
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent leading-none">
              ~120
            </p>
            <p className="text-[10px] font-mono text-ink-500 mt-1.5 uppercase tracking-wider">
              Subutai · live visitors
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent leading-none">
              ~80
            </p>
            <p className="text-[10px] font-mono text-ink-500 mt-1.5 uppercase tracking-wider">
              Played the install
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent leading-none">
              5–6w
            </p>
            <p className="text-[10px] font-mono text-ink-500 mt-1.5 uppercase tracking-wider">
              Concept → ship
            </p>
          </div>
        </div>

        {/* What's next footer — fills the card */}
        <div className="mt-auto pt-5 border-t border-white/[0.05]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-500 mb-2">
            What&apos;s next in my stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/[0.1] text-emerald-200 border border-emerald-500/20">
              Node + Express
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/[0.1] text-purple-200 border border-purple-500/20">
              LLM-integration
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/[0.1] text-indigo-200 border border-indigo-500/20">
              R3F · Framer Motion
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/[0.1] text-amber-200 border border-amber-500/20">
              German A1 → A2
            </span>
          </div>
        </div>
      </div>
    </Bento>
  );
}

/* ---------- Background: archive-style cards ---------- */

const BACKGROUND_CARDS = [
  {
    title: 'Visual Design',
    sub: 'Photoshop · Illustrator',
    subClass: 'text-pink-300/80',
    glow: 'pink',
    mark: '🎨',
    text: 'Freelance commissions — designed and sold custom digital assets.',
  },
  {
    title: 'Content & Audience',
    sub: 'Premiere Pro · YouTube',
    subClass: 'text-amber-300/80',
    glow: 'amber',
    mark: '▶',
    text: "100K+ views — understands how content reaches real audiences, not just how it's built.",
  },
  {
    title: 'Chess',
    sub: '2× College Tournament Winner',
    subClass: 'text-purple-300/80',
    glow: 'purple',
    mark: '♟',
    text: "Led Subutai's technical implementation as a chess player — built the move validator from the inside.",
  },
  {
    title: 'Figma',
    sub: 'UI Prototyping · Design Handoff',
    subClass: 'text-cyan-300/80',
    glow: 'cyan',
    mark: '◈',
    text: 'Built several site mockups — comfortable translating design files into code without friction.',
  },
] as const;

export function BackgroundGrid({
  className = 'grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4',
  cardClassName = 'p-5',
  large = false,
  wrap,
}: {
  className?: string;
  cardClassName?: string;
  /** roomier type for when each card has a whole screen to itself */
  large?: boolean;
  wrap?: Wrap;
}) {
  return (
    <div className={className}>
      {BACKGROUND_CARDS.map((c, i) => {
        const card = (
          <Bento className={`${cardClassName} relative overflow-hidden`} glow={c.glow} variant="archive">
            <span
              className="absolute -top-1 -right-1 text-[80px] leading-none opacity-[0.06] select-none pointer-events-none"
              aria-hidden="true"
            >
              {c.mark}
            </span>
            <div className="relative">
              <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-semibold text-ink-100 leading-tight tracking-tight`}>
                {c.title}
              </h3>
              <p className={`${large ? 'text-[12px]' : 'text-[10.5px]'} font-mono ${c.subClass} mt-1 tracking-wider`}>
                {c.sub}
              </p>
              <p className={`${large ? 'mt-5 text-[15px]' : 'mt-3.5 text-[12.5px]'} text-ink-400 leading-relaxed`}>
                {c.text}
              </p>
            </div>
          </Bento>
        );
        return <Fragment key={c.title}>{wrap ? wrap(card, i) : card}</Fragment>;
      })}
    </div>
  );
}

/* ---------- Quote ---------- */

const QUOTE_TEXT =
  'Very impressed by the idea — and the execution is impressive. Really something new and very cool. Thank you for such an experience.';

/** With `progress` (0..1) the words light up one by one as it moves; without it the quote is plain text. */
export function QuoteCard({ progress }: { progress?: MotionValue<number> }) {
  return (
    <div className="relative rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.06] via-purple-500/[0.04] to-transparent p-8 md:p-14 overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute -top-10 left-4 md:left-8 text-[180px] md:text-[240px] leading-none font-serif text-indigo-400/15 select-none pointer-events-none"
      >
        &ldquo;
      </span>
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.30), transparent 60%)' }}
      />
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-indigo-300/70 mb-6">
          04 / What people said
        </p>
        <blockquote>
          <p className="text-xl md:text-2xl lg:text-[28px] font-medium leading-snug text-ink-100 tracking-tight max-w-3xl">
            {progress ? <ScrubWords text={QUOTE_TEXT} progress={progress} /> : QUOTE_TEXT}
          </p>
          <footer className="mt-6 flex items-center gap-3">
            <span className="h-px w-10 bg-indigo-400/40" />
            <div className="font-mono text-[11.5px]">
              <span className="text-ink-200">Anonymous visitor</span>
              <span className="text-ink-500"> · Lucid Dreams 2026 · Subutai exhibit</span>
            </div>
          </footer>
        </blockquote>
        <p className="mt-7 text-[11px] font-mono text-ink-500">
          More quotes inside individual project cards above.
        </p>
      </div>
    </div>
  );
}

/* ---------- Contact ---------- */

export function ContactCard({ className = '' }: { className?: string }) {
  return (
    <Bento className={className} glow="indigo">
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 60%)' }}
      />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-indigo-400/80 mb-3">
            Let&apos;s talk
          </p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            Got a role or a project in mind?
          </h3>
          <p className="text-ink-300 mt-2">
            Based in {profile.location.city} — open to Vienna and remote.
          </p>
          <p className="text-ink-400 text-[13px] mt-1.5 font-mono">
            Replies within 24 hours.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={`mailto:${profile.contact.email}`}
            onClick={() => track('contact_clicked', { channel: 'email' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-glow text-white text-sm font-medium transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
          >
            ✉ Email me
          </a>
          <a
            href={profile.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('contact_clicked', { channel: 'linkedin' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:border-white/25"
          >
            in · LinkedIn
          </a>
          <a
            href={profile.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('contact_clicked', { channel: 'github' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:border-white/25"
          >
            ◉ GitHub
          </a>
        </div>
      </div>
    </Bento>
  );
}

/** "What's actually in the box" — kept under the contact card in both layouts. */
export function TechFooter({ className = 'mt-10' }: { className?: string }) {
  return (
    <div className={`${className} pt-6 border-t border-white/[0.06] space-y-2 text-[11px] font-mono text-ink-500`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-ink-400">
          <span className="text-ink-300">Built with</span>
          {' '}Next.js 14 (App Router) · React 18 · React Three Fiber · Tailwind · Framer Motion · TypeScript
        </span>
        <span>
          <span className="text-ink-300">Deploy</span> Vercel · static SSG · no backend
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <a
          href="https://github.com/B1toks/honchar-portfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-400 hover:text-indigo-300 transition-colors"
        >
          ◉ Source · github.com/B1toks/honchar-portfolio
        </a>
        <span>© 2026 Oleksandr Honchar · v1.0</span>
      </div>
    </div>
  );
}
