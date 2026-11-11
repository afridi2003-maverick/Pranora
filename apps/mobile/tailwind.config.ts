import type { Config } from 'tailwindcss';
import { colors, fonts } from '@pranora/ui';

const config: Config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
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

