import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2F7B53',
        green: {
          50: 'var(--color-green-50)',
          100: 'var(--color-green-100)',
          200: 'var(--color-green-200)',
          300: 'var(--color-green-300)',
          400: 'var(--color-green-400)',
          500: 'var(--color-green-500)',
          600: 'var(--color-green-600)',
          700: 'var(--color-green-700)',
          800: 'var(--color-green-800)',
          900: 'var(--color-green-900)',
        },
        lime: {
          300: 'var(--color-lime-300)',
          400: 'var(--color-lime-400)',
          500: 'var(--color-lime-500)',
        },
        emergency: {
          50: 'var(--color-emergency-50)',
          500: 'var(--color-emergency-500)',
          600: 'var(--color-emergency-600)',
          700: 'var(--color-emergency-700)',
        },
        app: {
          bg: 'var(--bg-app)',
          card: 'var(--surface-card)',
          elevated: 'var(--surface-elevated)',
          tinted: 'var(--surface-tinted)',
          glass: 'var(--surface-glass)',
        },
        surface: {
          secondary: 'var(--surface-secondary)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          disabled: 'var(--text-disabled)',
          inverse: 'var(--text-inverse)',
        },
        stroke: {
          subtle: 'var(--border-subtle)',
          medium: 'var(--border-medium)',
          active: 'var(--border-active)',
          focus: 'var(--border-focus)',
          glass: 'var(--border-glass)',
        },
      },
      fontFamily: {
        bangla: ['var(--font-bangla)'],
        english: ['var(--font-english)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
      },
    },
  },
  plugins: [],
};

export default config;
