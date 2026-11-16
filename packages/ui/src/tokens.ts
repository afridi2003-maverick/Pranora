export const colors = {
  green: {
    50: '#E1F3E1',
    100: '#B8E6B5',
    200: '#8CD2A3',
    300: '#6BBF8B',
    400: '#4BA772',
    500: '#3A9A63',
    600: '#2F7B53', // Primary brand
    700: '#256E4C',
    800: '#1D5A3F',
    900: '#154537',
  },
  lime: {
    300: '#BEF264',
    400: '#A3E635',
    500: '#84CC16',
  },
  emergency: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  primary: '#2F7B53',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const fonts = {
  bangla: 'Hind Siliguri, Noto Sans Bengali, sans-serif',
  english: 'Inter, system-ui, -apple-system, sans-serif',
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '28px',
  pill: '9999px',
} as const;

export const shadows = {
  1: '0 1px 3px rgba(0, 0, 0, 0.08)',
  2: '0 4px 16px rgba(0, 0, 0, 0.10)',
  3: '0 8px 32px rgba(0, 0, 0, 0.16)',
} as const;
