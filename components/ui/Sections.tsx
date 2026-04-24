'use client';

import { useEffect, useState } from 'react';
import { profile } from '@/lib/profile';
import { projects } from '@/lib/projects';

/* =========================================================
   Top Nav
   ========================================================= */
export function Nav() {
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
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between text-[11px] font-mono backdrop-blur-sm bg-ink-900/40 border-b border-white/[0.04]">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-ink-300 tracking-wider">AVAILABLE · JUNIOR FE / WERKSTUDENT</span>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-ink-400">
        <span>Vienna {time}</span>
        <span className="text-ink-700">|</span>
        <a
          href="https://b1toks.github.io/cv/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent hover:bg-accent-glow text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.45)]"
        >
          <span>↗</span> View CV
        </a>
      </div>
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
   3D Hint (floats under the canvas)
   ========================================================= */
export function Hint() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center gap-1.5 text-[11px] font-mono text-ink-400">
      <span className="opacity-80">← drag to rotate · scroll to zoom · click a piece →</span>
      <span className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center animate-bounce">↓</span>
    </div>
  );
}

/* =========================================================
   BENTO — about, languages, skills, contact
   ========================================================= */
function Bento({
  children,
  className = '',
  glow = 'indigo',
}: {
  children: React.ReactNode;
  className?: string;
  glow?: 'indigo' | 'purple' | 'cyan' | 'pink' | 'emerald' | 'amber';
}) {
  const glowMap: Record<string, string> = {
    indigo:  'hover:border-indigo-400/30 hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.45)]',
    purple:  'hover:border-purple-400/30 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.45)]',
    cyan:    'hover:border-cyan-400/30 hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.4)]',
    pink:    'hover:border-pink-400/30 hover:shadow-[0_0_60px_-15px_rgba(236,72,153,0.4)]',
    emerald: 'hover:border-emerald-400/30 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)]',
    amber:   'hover:border-amber-400/30 hover:shadow-[0_0_60px_-15px_rgba(245,158,11,0.4)]',
  };
  return (
    <div
      className={`bento group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-br from-ink-700/80 via-ink-800/60 to-ink-900 backdrop-blur-sm transition-all duration-500 ${glowMap[glow]} ${className}`}
    >
      <div className="noise absolute inset-0" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/* =========================================================
   About / Skills / Languages / Contact — bento content
   ========================================================= */
export function ContentSections({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section className="relative px-4 md:px-8 py-16 md:py-24 max-w-6xl mx-auto">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-indigo-400/80 mb-4">
        02 / About
      </p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl mb-10">
        Where I'm at — and where I'm heading.
      </h2>

      <div className="grid grid-cols-6 auto-rows-[minmax(140px,auto)] gap-3 md:gap-4">
        {/* ABOUT */}
        <Bento className="col-span-6 md:col-span-4 p-8" glow="indigo">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-indigo-400/80 mb-3">Bio</p>
          <p className="text-base md:text-lg text-ink-300 leading-relaxed">
            A <span className="text-ink-100">Front-End Developer</span> currently on
            <span className="text-ink-100"> Erasmus+</span> in Austria. Open for
            <span className="text-ink-100"> Junior or Werkstudent roles</span> today — core stack:
            <span className="text-ink-100"> React, TypeScript, Next.js, Tailwind</span>. My strength
            is taking a concept, refining it with the team, and carrying the technical implementation
            from prototype to the people who actually use it. Long-term I'm heading toward
            <span className="text-ink-100"> creative technology</span> — but builder first.
          </p>
        </Bento>

        {/* LANGUAGES */}
        <Bento className="col-span-6 md:col-span-2 p-6" glow="cyan">
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
        </Bento>

        {/* SKILLS — 4 bento cards with featured primary tech + category tint */}
        {([
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
        ] as const).map((g) => {
          const list = profile.skills[g.key as keyof typeof profile.skills] ?? [];
          const [featured, ...rest] = list;
          return (
            <Bento
              key={g.key}
              className="col-span-6 md:col-span-3 p-6 relative overflow-hidden"
              glow={g.glow}
            >
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
                  className={`inline-flex items-center gap-2 px-3.5 py-2 mb-3 rounded-lg bg-gradient-to-br ${g.featuredGrad} border ${g.featuredBorder} text-[13px] font-semibold ${g.featuredText} backdrop-blur-sm`}
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
        })}

        {/* EDUCATION */}
        <Bento className="col-span-6 md:col-span-3 p-6" glow="purple">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-purple-400/80 mb-3">
            Education
          </p>
          <div className="space-y-3">
            {profile.education.map((e) => (
              <div key={e.degree}>
                <h4 className="text-sm font-semibold text-ink-100">{e.degree}</h4>
                <p className="text-[12px] text-ink-300">{e.school}</p>
                <p className="text-[11px] font-mono text-ink-400 mt-0.5">{e.period}</p>
                {e.note && (
                  <p className="text-[11px] text-purple-300/80 mt-1">{e.note}</p>
                )}
              </div>
            ))}
          </div>
        </Bento>

        {/* STATS */}
        <Bento className="col-span-6 md:col-span-3 p-6" glow="indigo">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-indigo-400/80">
            By the numbers
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                5+
              </p>
              <p className="text-[10px] font-mono text-ink-500 mt-1 uppercase tracking-wider">
                Projects
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                3
              </p>
              <p className="text-[10px] font-mono text-ink-500 mt-1 uppercase tracking-wider">
                Terms
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                2
              </p>
              <p className="text-[10px] font-mono text-ink-500 mt-1 uppercase tracking-wider">
                Countries
              </p>
            </div>
          </div>
        </Bento>

        {/* PROJECTS QUICK LIST — clickable, routes to 3D modal */}
        <Bento className="col-span-6 p-8" glow="pink">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-pink-400/80 mb-5">
            03 / Projects index
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="text-left p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group/card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                    {p.pieceLabel}
                  </span>
                  <span className="text-ink-500 group-hover/card:text-ink-100 group-hover/card:translate-x-0.5 transition-all">
                    →
                  </span>
                </div>
                <h4 className="mt-1 text-lg font-semibold text-ink-100">{p.title}</h4>
                <p className="text-[12px] text-ink-400 mt-1 line-clamp-2">{p.summary}</p>
              </button>
            ))}
          </div>
        </Bento>

        {/* CONTACT CTA */}
        <Bento className="col-span-6 p-8 relative overflow-hidden" glow="indigo">
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 60%)' }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-indigo-400/80 mb-3">
                Let's talk
              </p>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Got a role or a project in mind?
              </h3>
              <p className="text-ink-300 mt-2">
                Based in {profile.location.city} — open across Austria and remote.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={`mailto:${profile.contact.email}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-glow text-white text-sm font-medium transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
              >
                ✉ Email me
              </a>
              <a
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:border-white/25"
              >
                in · LinkedIn
              </a>
              <a
                href={profile.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:border-white/25"
              >
                ◉ GitHub
              </a>
            </div>
          </div>
        </Bento>
      </div>

      <footer className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-ink-500">
        <span>© 2026 Oleksandr Honchar · v1.0</span>
        <span>Crafted with Next.js · React Three Fiber · Tailwind</span>
      </footer>
    </section>
  );
}
