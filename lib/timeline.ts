export type TimelineColor =
  | 'indigo'
  | 'purple'
  | 'cyan'
  | 'pink'
  | 'emerald'
  | 'amber';

export interface TimelineEvent {
  id: string;
  date: string;
  dateEnd?: string;
  title: string;
  tag?: string;          // primary badge — e.g. "Internship", "Technical Lead"
  program?: string;      // secondary context badge — e.g. "Erasmus+ project"
  role: string;
  description: string;
  stack?: string[];
  link?: { label: string; href: string };
  /** path under /public — e.g. '/screenshots/might.png'. If missing, a placeholder card is shown. */
  screenshot?: string;
  /** caption shown under the screenshot (optional) */
  screenshotCaption?: string;
  /** Tailwind aspect-ratio class. Default: 'aspect-video' (16:9). Use 'aspect-[3/4]' for tall portrait shots. */
  screenshotAspect?: string;
  color: TimelineColor;
}

/**
 * Career timeline — chronological order (oldest → newest).
 * Used by components/ui/Timeline.tsx.
 */
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'ekreative-i',
    date: 'Jan 2024',
    dateEnd: 'Feb 2024',
    title: 'eKreative — Internship I',
    tag: 'Internship',
    role: 'Front-End Developer Intern · Cherkasy, Ukraine',
    description:
      'First production work — translated complex Figma mockups into pixel-perfect React components and shipped my first React site with JSON data loading. Established my go-to component-architecture patterns.',
    stack: ['React', 'JavaScript', 'Figma'],
    screenshot: '/screenshots/ekreative-i.png',
    screenshotCaption: 'Finsweet — Figma → React adaptation, my first production site.',
    color: 'emerald',
  },
  {
    id: 'ekreative-ii',
    date: 'Jan 2025',
    dateEnd: 'Feb 2025',
    title: 'eKreative — Internship II',
    tag: 'Invited back',
    role: 'Front-End Developer Intern · Cherkasy, Ukraine',
    description:
      'Built a real-time traffic-monitoring application for Cherkasy using OpenStreetMap API with admin moderation logic. Invited back after Internship I based on rapid skill acquisition.',
    stack: ['React', 'JavaScript', 'OpenStreetMap API'],
    screenshot: '/screenshots/ekreative-ii.png',
    screenshotCaption: 'Traffic Lights Cherkasy — live status updates over OpenStreetMap.',
    color: 'emerald',
  },
  {
    id: 'showplus',
    date: 'Jan 2025',
    dateEnd: 'Mar 2025',
    title: 'ShowPlus — Commercial Rental Platform',
    tag: 'First commercial project',
    role: 'Web Developer · client work',
    description:
      'First paid commercial engagement — built a rental service platform for inflatable attractions on WordPress with customised Elementor components. Optimised performance and cross-device responsiveness against tight client requirements.',
    stack: ['WordPress', 'Elementor', 'Contact Form 7'],
    link: {
      label: 'Live',
      href: 'https://showplus-inflatables.com/',
    },
    screenshot: '/screenshots/showplus.png',
    screenshotCaption: 'ShowPlus — rental landing for inflatable attractions.',
    color: 'amber',
  },
  {
    id: 'might',
    date: 'Mar 2025',
    dateEnd: 'Jun 2025',
    title: 'mIGHT — Learning Management System',
    tag: 'Lead Developer',
    role: 'Lead Developer',
    description:
      'Engineered a full LMS from scratch — role-based access (Admin / Teacher / Student), dynamic auto-save grade journal, and a dark-themed adaptive calendar with animated transitions.',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'ShadCN UI'],
    link: {
      label: 'Live demo',
      href: 'https://project-g-b1toks-projects.vercel.app/',
    },
    screenshot: '/screenshots/might.png',
    screenshotCaption: 'mIGHT — dashboard, courses, and adaptive calendar.',
    color: 'purple',
  },
  {
    id: 'niftyhr',
    date: 'May 2025',
    dateEnd: 'Jul 2025',
    title: 'NiftyHR',
    tag: 'Interim contract',
    role: 'Interim Front-End Developer · Cherkasy, Ukraine',
    description:
      'Stepped in on a live commercial HR platform during a developer handover — debugged, shipped features, and kept delivery continuous through the team transition.',
    stack: ['React', 'TypeScript'],
    screenshot: '/screenshots/niftyhr.png',
    screenshotCaption: 'NiftyHR — commercial HR platform marketing site.',
    /** intrinsic image ratio: 2880×1344 = 15:7 exactly — fits without any cropping */
    screenshotAspect: 'aspect-[15/7]',
    color: 'cyan',
  },
  {
    id: 'subutai',
    date: 'Feb 2026',
    dateEnd: 'Present',
    title: 'Subutai — Kinetic Chess',
    tag: 'Technical Lead',
    program: 'Erasmus+ project',
    role: 'Technical Lead · 5-person international team',
    description:
      'Built during my Erasmus+ exchange at FH St. Pölten — a Chess 960 variant with dynamically rotating 2×2 board segments and custom castling rules. Owned the technical implementation end-to-end. Selected exhibitor at Lucid Dreams 2026 (Projekt 027).',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind', 'ShadCN'],
    link: {
      label: 'Live + Lucid Dreams',
      href: 'https://b1toks.github.io/subutai/',
    },
    screenshot: '/screenshots/subutai.png',
    screenshotCaption: 'Subutai — kinetic chess board with rotating 2×2 segments.',
    color: 'indigo',
  },
];
