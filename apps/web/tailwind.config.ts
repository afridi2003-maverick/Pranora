import type { Config } from 'tailwindcss';
import { colors, fonts } from '@pranora/ui';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: colors.green,
        primary: colors.primary,
        white: colors.white,
        black: colors.black,
        emergency: colors.emergency,
      },
      fontFamily: {
        bangla: [fonts.bangla],
        english: [fonts.english],
      },
    },
  },
  plugins: [],
};

export default config;

