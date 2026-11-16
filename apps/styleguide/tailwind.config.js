/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      mobile: '390px',
      tablet: '768px',
      desktop: '1280px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
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
      transitionDuration: {
        150: '150ms',
        250: '250ms',
        400: '400ms',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
      },
    },
  },
  plugins: [],
};
