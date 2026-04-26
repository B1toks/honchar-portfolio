'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '@/lib/profile';

const PROMPT = 'visitor@honchar:~$ ';

type Line = {
  id: number;
  type: 'command' | 'output' | 'error';
  text: string;
  typing: boolean;
};

/* ============================================================
   Command executor — returns text or special signals
   ============================================================ */
function execute(raw: string): string {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case 'help':
      return [
        'Available commands:',
        '',
        '  whoami         short bio',
        '  stack          full tech stack by category',
        '  projects       list of projects (with links)',
        '  experience     career timeline',
        '  contact        email · linkedin · github',
        '  status         current availability',
        '  clear          clear the terminal',
        '  exit           close the terminal',
        '',
        '  ↑/↓            navigate command history',
        '  Esc            close terminal',
        '',
        "Try 'sudo hire me' if you're feeling bold.",
      ].join('\n');

    case 'whoami':
      return [
        'Oleksandr Honchar',
        'Junior Front-End Developer · currently on Erasmus+ in Austria.',
        'React · TypeScript · Next.js · Tailwind. Builder first, creative technologist later.',
      ].join('\n');

    case 'stack':
      return Object.entries(profile.skills)
        .map(([group, list]) => `${group}:\n  ${list.join(', ')}`)
        .join('\n\n');

    case 'projects': {
      const list = [
        { t: 'Subutai — Kinetic Chess (EPS · Lucid Dreams 2026)', l: 'https://b1toks.github.io/subutai/' },
        { t: 'mIGHT — Learning Management System',                l: 'https://project-g-b1toks-projects.vercel.app/' },
        { t: 'ShowPlus — Commercial Rental Platform',             l: 'https://showplus-inflatables.com/' },
        { t: 'NiftyHR — Interim FE contract (May–Jul 2025)',      l: '' },
        { t: 'eKreative — Two internship terms (Cherkasy)',       l: '' },
      ];
      const lines: string[] = [];
      list.forEach((p) => {
        lines.push(`• ${p.t}`);
        if (p.l) lines.push(`  ${p.l}`);
      });
      return lines.join('\n');
    }

    case 'experience':
      return [
        'Feb 2026 — Present   Subutai · Technical Lead (Erasmus+ project at FH St. Pölten)',
        'May 2025 — Jul 2025  NiftyHR · Interim Front-End',
        'Mar 2025 — Jun 2025  mIGHT LMS · Lead Developer',
        'Jan 2025 — Mar 2025  ShowPlus · First commercial project',
        'Jan 2025 — Feb 2025  eKreative · Internship II (invited back)',
        'Jan 2024 — Feb 2024  eKreative · Internship I',
      ].join('\n');

    case 'contact':
      return [
        `email      ${profile.contact.email}`,
        `linkedin   ${profile.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '')}`,
        `github     ${profile.contact.github.replace(/^https?:\/\//, '')}`,
        `phone      ${profile.contact.phone}`,
        '',
        `Based in ${profile.location.city}, ${profile.location.country}.`,
        'Open to Junior FE / Werkstudent across DACH and remote.',
      ].join('\n');

    case 'status':
      return '● Available · Junior FE / Werkstudent · Vienna / St. Pölten / Remote';

    case 'clear':
      return '__CLEAR__';

    case 'exit':
    case 'quit':
    case 'q':
      return '__EXIT__';

    case 'sudo hire me':
      return [
        '[sudo] password for visitor: ●●●●●●●●',
        '',
        '✔ Permission granted.',
        `→ Forwarding your offer to ${profile.contact.email}...`,
        '',
        "Just kidding. But seriously — let's talk.",
      ].join('\n');

    /* small extras for fun */
    case 'ls':
      return 'about/   background/   path/   contact/   resume.pdf';
    case 'pwd':
      return '/home/visitor/honchar-portfolio';
    case 'date':
      return new Date().toString();
    case 'echo $shell':
      return '/bin/honchar';

    case '':
      return '';

    default:
      return `command not found: ${raw}\nType 'help' to see what's available.`;
  }
}

/* ============================================================
   Single line — char-by-char typing animation.

   Key trick: dependency = [line.id] (a stable primitive), so the
   effect only re-runs when this is a brand-new line — NOT on every
   parent re-render (which happens on each keystroke in input).
   In React 18 strict-mode dev the effect mounts twice; the timer
   simply restarts from i = 0 and completes — visible only as a
   tiny stutter in dev, smooth in production.
   ============================================================ */
function LineRow({ line }: { line: Line }) {
  const [shown, setShown] = useState(line.typing ? '' : line.text);

  useEffect(() => {
    if (!line.typing) {
      setShown(line.text);
      return;
    }

    let i = 0;
    // total typing time scaled by length, capped ~600ms
    const total = Math.min(600, Math.max(120, line.text.length * 6));
    const step = Math.max(1, Math.ceil(line.text.length / (total / 12)));
    const timer = setInterval(() => {
      i = Math.min(i + step, line.text.length);
      setShown(line.text.slice(0, i));
      if (i >= line.text.length) clearInterval(timer);
    }, 12);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.id]);

  if (line.type === 'command') {
    return (
      <div className="flex">
        <span className="text-emerald-400 shrink-0">{PROMPT}</span>
        <span className="text-emerald-200">{shown}</span>
      </div>
    );
  }
  if (line.type === 'error') {
    return <pre className="text-rose-300 whitespace-pre-wrap font-mono">{shown}</pre>;
  }
  return <pre className="text-emerald-300/95 whitespace-pre-wrap font-mono">{shown}</pre>;
}

/* ============================================================
   Terminal overlay
   ============================================================ */
export function Terminal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIdx, setCmdIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  /* welcome banner on first open */
  useEffect(() => {
    if (open && history.length === 0) {
      setHistory([
        {
          id: nextId(),
          type: 'output',
          typing: true,
          text:
            "honchar-terminal — v1.0.0\n" +
            "Type 'help' to see what's available.",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* focus input */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ESC to close */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* auto-scroll to bottom */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const submit = () => {
    const raw = input;
    setInput('');
    setCmdIdx(-1);
    if (raw.trim()) {
      setCmdHistory((h) => [raw, ...h]);
    }
    setHistory((h) => [
      ...h,
      { id: nextId(), type: 'command', text: raw, typing: false },
    ]);

    const out = execute(raw);
    if (out === '__CLEAR__') {
      setHistory([]);
      return;
    }
    if (out === '__EXIT__') {
      onClose();
      return;
    }
    if (out === '') return;

    const isError = out.startsWith('command not found');
    setHistory((h) => [
      ...h,
      {
        id: nextId(),
        type: isError ? 'error' : 'output',
        text: out,
        typing: true,
      },
    ]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const next = Math.min(cmdIdx + 1, cmdHistory.length - 1);
      setCmdIdx(next);
      setInput(cmdHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIdx <= 0) {
        setCmdIdx(-1);
        setInput('');
      } else {
        const next = cmdIdx - 1;
        setCmdIdx(next);
        setInput(cmdHistory[next] ?? '');
      }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      // Ctrl/Cmd + L → clear
      e.preventDefault();
      setHistory([]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* window */}
          <motion.section
            role="dialog"
            aria-label="Interactive terminal"
            className="relative w-full max-w-3xl h-[70vh] max-h-[640px] rounded-xl overflow-hidden shadow-[0_30px_120px_-20px_rgba(0,0,0,0.7)] flex flex-col font-mono"
            style={{ background: '#0a0e14' }}
            initial={{ y: 30, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          >
            {/* title bar */}
            <header className="flex items-center justify-between px-4 py-2.5 bg-[#0f1419] border-b border-white/5 select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onClose}
                  aria-label="Close terminal"
                  className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors"
                />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" aria-hidden="true" />
              </div>
              <span className="text-[11px] text-slate-400">honchar@portfolio:~</span>
              <button
                onClick={onClose}
                aria-label="Close terminal"
                className="text-slate-400 hover:text-slate-100 text-lg leading-none w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </header>

            {/* body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 text-[13px] leading-[1.55] cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line) => (
                <LineRow key={line.id} line={line} />
              ))}

              {/* current input prompt */}
              <div className="flex items-center mt-1">
                <span className="text-emerald-400 shrink-0">{PROMPT}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Terminal input"
                  className="flex-1 bg-transparent outline-none text-emerald-200 caret-emerald-400 font-mono"
                />
                <span
                  className="ml-0.5 inline-block w-2 h-[1em] bg-emerald-400 animate-[blink_1s_steps(2)_infinite]"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* footer hint */}
            <footer className="px-4 py-2 bg-[#0f1419]/60 border-t border-white/5 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>type <span className="text-emerald-300">help</span> for commands</span>
              <span>esc to close · ↑/↓ history · ctrl+l clear</span>
            </footer>
          </motion.section>

          {/* keyframes for the blinking cursor (one-off) */}
          <style jsx global>{`
            @keyframes blink {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
