import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          900: '#030712',
          800: '#0b0f1a',
          700: '#0f172a',
          600: '#1e293b',
          500: '#334155',
          400: '#64748b',
          300: '#94a3b8',
          100: '#f1f5f9',
        },
        accent: {
          DEFAULT: '#6366f1',
          soft: '#eef2ff',
          deep: '#3730a3',
          glow: '#818cf8',
        },
      },
      animation: {
        'pulse-soft': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orb': 'orb 6s ease-in-out infinite',
        'sparkle': 'sparkle 2.5s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        orb: {
          '0%, 100%': { opacity: '0.4', transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { opacity: '0.7', transform: 'translate(-50%, -50%) scale(1.1)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
