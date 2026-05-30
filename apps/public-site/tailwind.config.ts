import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"Manrope"', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'nfc': 'nfc 2.8s cubic-bezier(.2,.7,.2,1) infinite',
        'floaty': 'floaty 6s ease-in-out infinite',
        'scrollx': 'scrollx 32s linear infinite',
        'mnav': 'mnav .3s cubic-bezier(.2,.7,.2,1)',
        'field-pulse': 'fieldPulse .7s cubic-bezier(.2,.7,.2,1)',
        'spin-local': 'spin .7s linear infinite',
      },
      keyframes: {
        nfc: {
          '0%': { transform: 'translate(-50%,-50%) scale(.3)', opacity: '0.9' },
          '70%': { opacity: '0.25' },
          '100%': { transform: 'translate(-50%,-50%) scale(3.4)', opacity: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scrollx: {
          to: { transform: 'translateX(-50%)' },
        },
        mnav: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fieldPulse: {
          '0%': { boxShadow: '0 0 0 0 color-mix(in oklab, var(--accent) 45%, transparent)' },
          '100%': { boxShadow: '0 0 0 14px transparent' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
