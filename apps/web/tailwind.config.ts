import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef3ec',
          100: '#fde8d4',
          200: '#fbd1aa',
          300: '#f8b47a',
          400: '#f49050',
          500: '#C45E2A',
          600: '#A84E22',
          700: '#8B3F1A',
          800: '#6e3215',
          900: '#552611',
        },
        clay: {
          canvas:   '#F5F0E8',
          surface:  '#FEFCF9',
          card:     '#FFFFFF',
          border:   '#E8E0D0',
          text:     '#2C2418',
          muted:    '#8C7B6B',
        },
      },
      animation: {
        'slide-down': 'slide-down 0.4s ease-out both',
        'fade-up':    'fade-up 0.5s ease-out both',
        'pop':        'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      keyframes: {
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
