export type PieceId = 'king' | 'queen' | 'knight' | 'rook' | 'bishop' | 'pawn';

export type AccentColor = 'indigo' | 'purple' | 'cyan' | 'pink' | 'emerald' | 'amber';

export interface ProjectLink {
  label: string;
  href: string;
  icon: 'external' | 'star' | 'github' | 'linkedin' | 'mail';
}

export interface Project {
  id: PieceId;
  pieceLabel: string;      // "King", "Queen", etc. for the 3D tooltip
  title: string;
  subtitle: string;
  role: string;
  period?: string;
  summary: string;         // 1-2 line teaser
  body: string;            // full modal body
  tech: string[];
  links?: ProjectLink[];
  highlights?: string[];   // bullets for the modal
  color: AccentColor;
  isPlaceholder?: boolean; // Queen = "seeking" placeholder
}

export const projects: Project[] = [
  {
    id: 'king',
    pieceLabel: 'King',
    title: 'Subutai — Kinetic Chess',
    subtitle: 'EPS Project · Selected for Lucid Dreams 2026',
    role: 'Technical Lead',
    period: 'Feb 2026 — Present',
    summary: 'Chess 960 variant with dynamically rotating 2×2 board segments.',
    body:
      "An innovative kinetic chess game where 2×2 segments of the board rotate mid-game, forcing players to re-read the position on every turn. Architected solo as Technical Lead for a 5-person international team at FH St. Pölten. Selected exhibitor at Lucid Dreams 2026 (Projekt 027) — the annual interactive media showcase where invited student teams present their work to a public audience.",
    highlights: [
      'Architected Chess 960 variant with dynamically rotating 2×2 board segments',
      'Engineered segment rotation math, custom castling rules, and global state synchronization',
      'Solo technical lead for a 5-person international team — delivered a performant React app',
      'Selected exhibitor at Lucid Dreams 2026 · Projekt 027 (FH St. Pölten)',
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind', 'ShadCN'],
    links: [
      { label: 'Live demo', href: 'https://b1toks.github.io/subutai/', icon: 'external' },
      { label: 'Lucid Dreams · Projekt 027', href: 'https://www.lucid-dreams.at/2026-projekte/projekt-027', icon: 'star' },
    ],
    color: 'indigo',
  },
  {
    id: 'queen',
    pieceLabel: 'Queen',
    title: "The role I'm searching for",
    subtitle: 'Open for hire · DACH region',
    role: 'Junior FE / Werkstudent',
    summary:
      "The most powerful piece hasn't moved yet — and that's the role I'm still looking for.",
    body:
      "I'm energised by the full loop — dreaming something up, building it, then watching real people respond to it (Subutai on stage at Lucid Dreams was the most recent rush of that). I want a team that trusts a junior with the full concept-to-ship cycle, real users at the other end, and room to grow toward creative technology and WebGL over the next 1–2 years. Builder first today, creative technologist later.",
    highlights: [
      'Energised by the full loop: ideation → ship → real-user reaction',
      'Long-term direction: creative technology · WebGL · design engineering',
      'Available now · Vienna / St. Pölten / Remote',
    ],
    tech: ['Ownership', 'Curiosity', 'Audience', 'Craft'],
    links: [
      { label: 'Email me', href: 'mailto:alexhonchar4@gmail.com', icon: 'mail' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/honchar-alex/', icon: 'linkedin' },
    ],
    color: 'pink',
    isPlaceholder: true,
  },
  {
    id: 'knight',
    pieceLabel: 'Knight',
    title: 'mIGHT',
    subtitle: 'Learning Management System',
    role: 'Lead Developer',
    summary:
      'Full LMS from scratch — role-based access, grade journals, dark adaptive calendar.',
    body:
      'A comprehensive LMS engineered from scratch with three distinct role experiences (Admin, Teacher, Student). Features a dynamic auto-save grade journal and a dark-themed adaptive calendar with animated transitions — a premium UX on top of real LMS complexity.',
    highlights: [
      'Role-based access for Admin / Teacher / Student',
      'Dynamic grade journal with auto-save',
      'Dark-themed adaptive calendar + animated transitions',
    ],
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'ShadCN UI'],
    links: [
      { label: 'Live', href: 'https://project-g-b1toks-projects.vercel.app/', icon: 'external' },
    ],
    color: 'purple',
  },
  {
    id: 'rook',
    pieceLabel: 'Rook',
    title: 'NiftyHR',
    subtitle: 'Interim Front-End · Commercial HRTech',
    role: 'Interim Front-End Developer',
    period: 'May 2025 — Jul 2025',
    summary:
      'Short contract on a commercial HR platform during a developer handover.',
    body:
      'A short contract on a live commercial HR platform during a developer handover. Debugged, shipped features, and kept delivery continuous while the team transitioned.',
    highlights: [
      'Maintained delivery momentum through a developer handover',
      'Continuous feature delivery under real production constraints',
    ],
    tech: ['React', 'TypeScript'],
    color: 'cyan',
  },
  {
    id: 'bishop',
    pieceLabel: 'Bishop',
    title: 'ShowPlus',
    subtitle: 'Commercial Rental Platform',
    role: 'Web Developer',
    summary:
      "First commercial project — translated client requirements into a functional business tool.",
    body:
      'A rental service platform for inflatable attractions — my first real taste of commercial web work. Customised Elementor components, optimised performance, and shipped cross-device responsiveness against tight client requirements.',
    highlights: [
      'Customised Elementor components against client requirements',
      'Optimised site performance + cross-device responsiveness',
      'First commercial client engagement — learned the business side',
    ],
    tech: ['WordPress', 'Elementor', 'Contact Form 7'],
    links: [
      { label: 'Live', href: 'https://showplus-inflatables.com/', icon: 'external' },
    ],
    color: 'amber',
  },
  {
    id: 'pawn',
    pieceLabel: 'Pawn',
    title: 'eKreative Internships',
    subtitle: 'Where it started · Two terms',
    role: 'Front-End Developer Intern',
    period: 'Jan 2024 — Feb 2025',
    summary:
      'Two successful internship terms — invited back for high performance.',
    body:
      'Two internships at eKreative in Cherkasy. Started with Figma → React translations, then came back a year later to build a real-time traffic-monitoring app for Cherkasy using OpenStreetMap API and admin moderation. Invited back for term II based on rapid skill acquisition.',
    highlights: [
      'Translated complex Figma mockups into pixel-perfect React',
      'Built real-time traffic monitoring — OpenStreetMap + admin moderation',
      'Invited back for a second term — rapid skill acquisition',
    ],
    tech: ['React', 'JavaScript', 'OpenStreetMap API'],
    color: 'emerald',
  },
];

export const projectById = (id: PieceId) => projects.find((p) => p.id === id);
