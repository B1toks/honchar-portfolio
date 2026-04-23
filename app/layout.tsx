import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oleksandr Honchar — Junior Front-End Developer',
  description:
    'React, TypeScript, Next.js. Computer Engineering Bachelor on Erasmus+ in Austria. Open for Werkstudent & Junior FE roles in Vienna / St. Pölten / Remote.',
  authors: [{ name: 'Oleksandr Honchar' }],
  openGraph: {
    title: 'Oleksandr Honchar — Junior Front-End Developer',
    description:
      'React · TypeScript · Next.js. Erasmus+ in Austria. Open for Werkstudent & Junior FE roles.',
    type: 'profile',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-ink-900 text-ink-100 antialiased font-sans">
        <div className="cursor-glow" id="cursor-glow" aria-hidden="true" />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const glow = document.getElementById('cursor-glow');
                if (!glow) return;
                document.addEventListener('mousemove', e => {
                  glow.style.left = e.clientX + 'px';
                  glow.style.top = e.clientY + 'px';
                  glow.style.opacity = '1';
                });
                document.addEventListener('mouseleave', () => {
                  glow.style.opacity = '0';
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
