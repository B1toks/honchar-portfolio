# honchar-portfolio

An interactive 3D portfolio built with **Next.js + React Three Fiber** — each piece on a kinetic chessboard opens a project modal. Live at **[honchar.dev](https://www.honchar.dev)**.

🎯 **Live:** [www.honchar.dev](https://www.honchar.dev)

---

## What it does

- **3D chessboard hero** — 6 chess pieces (each = a project), idle bobbing animation, random "moves" every few seconds following actual chess rules
- **Click a piece** → animated modal with case-study (project, role, stack, links)
- **Path section** — vertical timeline of every job/project with screenshots
- **Background section** — 4 archive cards explaining what shaped my approach beyond code
- **Terminal mode** — press `` ` `` (backtick) to open an interactive terminal: `help`, `whoami`, `stack`, `projects`, `experience`, `contact`, `sudo hire me` 🥚
- **Live CV link** — pulls latest from `b1toks.github.io/cv/`

## Tech

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **React Three Fiber** + **drei** + **Three.js** — 3D scene with custom-built low-poly chess pieces (lathe geometry from sampled radial profiles)
- **Framer Motion** — modal + timeline scroll-reveal
- **Tailwind CSS** + custom design tokens (Inter + JetBrains Mono pair)
- **Vercel** — deploy with auto-builds on push to `main`

## Run locally

```bash
git clone https://github.com/B1toks/honchar-portfolio.git
cd honchar-portfolio
npm install
npm run dev
```

Open <http://localhost:3000>.

## What I focused on

This was my first serious 3D project and a deliberate craft exercise — building chess piece geometry from procedurally sampled lathe profiles instead of using GLB models, because I wanted to understand R3F primitives before reaching for assets. The "chess manager" runs as a singleton with random move scheduling, idle-bob phases, and arc-jump animations using pure interpolation in `useFrame`.

The terminal mode was a self-imposed constraint to prove I can ship a polished interactive surface — typing animation that doesn't restart on parent re-render, command history with arrow keys, ESC-to-close.

---

Built by **Oleksandr Honchar** · [honchar.dev](https://www.honchar.dev) · [LinkedIn](https://www.linkedin.com/in/honchar-oleksandr/)
