import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F7F5F0',
        'parchment-deep': '#EAE7DF',
        ink: '#1A1918',
        'amber-accent': '#B8895F',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'serif'],
      },
      boxShadow: {
        'ledger': '0 4px 6px rgba(26, 25, 24, 0.04), 0 10px 15px rgba(26, 25, 24, 0.08), 0 20px 25px rgba(26, 25, 24, 0.1)',
      }
    },
  },
  plugins: [],
};

export default config;
