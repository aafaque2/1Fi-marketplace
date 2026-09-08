import type { Config } from 'tailwindcss';

// Brand purple scale (SPEC.md §9). Loaded by app/globals.css via `@config`.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4EEFC',
          100: '#E5D6F8',
          200: '#CBADF1',
          300: '#AD82E8',
          400: '#9160DE',
          500: '#7A3FD6',
          600: '#6C28D9', // base
          700: '#571FB0',
          800: '#421887',
          900: '#2D1160',
        },
      },
    },
  },
  plugins: [],
};

export default config;
