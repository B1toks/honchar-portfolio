'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ProjectModal } from '@/components/ui/ProjectModal';
import { Nav, HeroOverlay, Hint, ContentSections } from '@/components/ui/Sections';
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

      {/* HERO — 3D scene fills the viewport */}
      <section className="relative h-[100svh] w-full overflow-hidden">
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
            onSelect={(id) => setSelectedId(id)}
            selectedId={selectedId}
          />
        </div>

        <Hint />
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
