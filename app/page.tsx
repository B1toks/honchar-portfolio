'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { track } from '@vercel/analytics';
import { ProjectModal } from '@/components/ui/ProjectModal';
import { Nav, HeroOverlay, Hint, ContentSections } from '@/components/ui/Sections';
import { clamp01, useEffectsOn, usePageProgress, useScrollValue } from '@/components/ui/scrollfx';
import { Terminal } from '@/components/ui/Terminal';
import { projectById, type PieceId } from '@/lib/projects';

// R3F must be client-only — skip SSR to avoid hydration/WebGL issues
const Scene = dynamic(
  () => import('@/components/three/Scene').then((m) => m.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 rounded-full border-2 border-indigo-400/40 border-t-indigo-300 animate-spin" />
          <span className="text-[11px] font-mono text-ink-400">Loading 3D scene…</span>
        </div>
      </div>
    ),
  },
);

export default function Home() {
  const [selectedId, setSelectedId] = useState<PieceId | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const selected = selectedId ? projectById(selectedId) : null;

  // The 3D scene renders every frame; stop it once the page has scrolled past the hero.
  const heroRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      rootMargin: '120px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the hero drifts down slower than the page and darkens as it leaves, which reads as depth.
  // It darkens with an overlay: opacity on the wrapper would force an offscreen pass for the live canvas.
  const effectsOn = useEffectsOn();
  const heroLeft = useScrollValue(heroRef, (r, vh) => clamp01(-r.top / vh));
  const heroY = useTransform(heroLeft, [0, 1], [0, 140]);
  const heroDim = useTransform(heroLeft, [0, 0.9], [0, 0.8]);

  // how far down the page people get: one event per quarter
  const pageProgress = usePageProgress();
  const depthSent = useRef(0);
  useMotionValueEvent(pageProgress, 'change', (v) => {
    for (const m of [0.25, 0.5, 0.75, 1]) {
      if (v >= (m === 1 ? 0.98 : m) && depthSent.current < m) {
        depthSent.current = m;
        track('scroll_depth', { pct: m * 100 });
      }
    }
  });

  // engagement events — a single-page site has no second pageview,
  // so these are what stand in for "did they actually look around"
  useEffect(() => {
    if (terminalOpen) track('terminal_opened');
  }, [terminalOpen]);

  // Keyboard shortcut: ` (backtick) or ~ to toggle terminal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing into input/textarea/contentEditable
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="relative min-h-screen">
      <Nav onOpenTerminal={() => setTerminalOpen(true)} />

      {/* HERO — 3D scene fills the first screen */}
      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden">
        <motion.div
          style={effectsOn ? { y: heroY } : undefined}
          className="absolute inset-0 will-change-transform"
        >
          {/* ambient orbs */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-40 pointer-events-none animate-orb"
            style={{ top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)' }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none animate-orb"
            style={{ bottom: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', animationDelay: '-3s' }}
          />

          <HeroOverlay />

          <div className="absolute inset-0">
            <Scene
              active={heroVisible}
              onSelect={(id) => {
                setSelectedId(id);
                track('piece_clicked', { piece: id, project: projectById(id)?.title ?? id });
              }}
              selectedId={selectedId}
            />
          </div>

          <Hint />
        </motion.div>
        {effectsOn && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: heroDim }}
            className="pointer-events-none absolute inset-0 z-20 bg-ink-900 will-change-[opacity]"
          />
        )}
      </section>

      <ContentSections />

      <ProjectModal
        project={selected ?? null}
        onClose={() => setSelectedId(null)}
      />

      <Terminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </main>
  );
}
