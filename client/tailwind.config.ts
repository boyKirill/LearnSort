import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        accent: '#7C3AED',
        cyan: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        destructive: '#EF4444',
        surface: '#F8FAFC',
        ink: '#0F172A',
        muted: '#475569',
        border: '#E2E8F0',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(79, 70, 229, 0.10)',
        card: '0 18px 40px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '18px',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(6,182,212,0.12), rgba(124,58,237,0.12))',
      },
    },
  },
  plugins: [],
} satisfies Config;
