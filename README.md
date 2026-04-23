# honchar-portfolio

Interactive 3D portfolio — Next.js + React Three Fiber + Tailwind.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `app/` — Next.js App Router (layout, page, globals)
- `components/three/` — R3F canvas, board, chess pieces (low-poly)
- `components/ui/` — nav, hero overlay, modal, bento sections
- `lib/projects.ts` — project data (which chess piece = which project)
- `lib/profile.ts` — bio, languages, skills, education, contact
- `public/cv/` — put your CV PDF here (expected: `Oleksandr_Honchar_CV.pdf`)

## Chess piece → project mapping

| Piece  | Project           |
|--------|-------------------|
| King   | Subutai (Lucid Dreams) |
| Queen  | "Seeking" — open for hire |
| Knight | mIGHT (LMS)       |
| Rook   | NiftyHR           |
| Bishop | ShowPlus          |
| Pawn   | eKreative internships |

## Deploy

```bash
npx vercel
```
