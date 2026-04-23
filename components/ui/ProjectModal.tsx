'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Project } from '@/lib/projects';

const ACCENT_CLASSES: Record<Project['color'], string> = {
  indigo:  'from-indigo-500/20 to-indigo-500/0 border-indigo-400/30 shadow-[0_0_80px_-20px_rgba(99,102,241,0.6)]',
  purple:  'from-purple-500/20 to-purple-500/0 border-purple-400/30 shadow-[0_0_80px_-20px_rgba(168,85,247,0.6)]',
  cyan:    'from-cyan-500/20 to-cyan-500/0 border-cyan-400/30 shadow-[0_0_80px_-20px_rgba(34,211,238,0.6)]',
  pink:    'from-pink-500/20 to-pink-500/0 border-pink-400/30 shadow-[0_0_80px_-20px_rgba(236,72,153,0.6)]',
  emerald: 'from-emerald-500/20 to-emerald-500/0 border-emerald-400/30 shadow-[0_0_80px_-20px_rgba(16,185,129,0.6)]',
  amber:   'from-amber-500/20 to-amber-500/0 border-amber-400/30 shadow-[0_0_80px_-20px_rgba(245,158,11,0.6)]',
};

const LABEL_COLOR: Record<Project['color'], string> = {
  indigo:  'text-indigo-300',
  purple:  'text-purple-300',
  cyan:    'text-cyan-300',
  pink:    'text-pink-300',
  emerald: 'text-emerald-300',
  amber:   'text-amber-300',
};

const ICON_MAP: Record<'external' | 'star' | 'github' | 'linkedin' | 'mail', string> = {
  external: '↗',
  star:     '★',
  github:   '◉',
  linkedin: 'in',
  mail:     '✉',
};

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-ink-900/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            key={project.id}
            className={`relative w-full max-w-2xl rounded-[28px] border ${ACCENT_CLASSES[project.color].split(' ').slice(-2).join(' ')} bg-gradient-to-br from-ink-700/90 via-ink-800/90 to-ink-900 backdrop-blur-xl p-8 md:p-10 overflow-hidden`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          >
            {/* soft gradient wash */}
            <div className={`absolute inset-0 bg-gradient-to-br ${ACCENT_CLASSES[project.color].split(' ').slice(0, 2).join(' ')} pointer-events-none`} />
            <div className="noise absolute inset-0" />

            {/* close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 flex items-center justify-center text-ink-300 hover:text-white transition-all z-10"
            >
              ×
            </button>

            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 ${LABEL_COLOR[project.color]}`}>
                  {project.pieceLabel} · {project.subtitle}
                </span>
                {project.isPlaceholder && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-pink-500/10 text-pink-300 border border-pink-500/20 animate-pulse">
                    ● OPEN
                  </span>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                {project.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-mono text-ink-400">
                <span>{project.role}</span>
                {project.period && <><span className="text-ink-600">|</span><span>{project.period}</span></>}
              </div>

              <p className="mt-5 text-ink-300 leading-relaxed">
                {project.body}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-200">
                      <span className={`mt-[7px] block w-1.5 h-1.5 rounded-full ${LABEL_COLOR[project.color].replace('text-', 'bg-').replace('-300', '-400')}`} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-white/[0.04] border border-white/10 text-ink-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {project.links && project.links.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {project.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-sm font-medium transition-all"
                    >
                      <span className="text-[11px] opacity-80">{ICON_MAP[l.icon]}</span>
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
