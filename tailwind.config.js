/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terminal green palette
        term: {
          black:    '#020c02',
          darker:   '#040f04',
          dark:     '#061006',
          surface:  '#0a180a',
          card:     '#0d1f0d',
          border:   '#1a3a1a',
          dim:      '#1f4d1f',
          muted:    '#2d7a2d',
          mid:      '#3a9e3a',
          base:     '#00c832',
          bright:   '#00ff41',
          glow:     '#39ff14',
          amber:    '#ffb300',
          red:      '#ff3333',
          cyan:     '#00ffcc',
          white:    '#e0ffe0',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-sm':  '0 0 6px  rgba(0, 255, 65, 0.4)',
        'glow':     '0 0 12px rgba(0, 255, 65, 0.5)',
        'glow-lg':  '0 0 24px rgba(0, 255, 65, 0.4), 0 0 48px rgba(0, 255, 65, 0.15)',
        'glow-xl':  '0 0 40px rgba(0, 255, 65, 0.5), 0 0 80px rgba(0, 255, 65, 0.2)',
        'inset-glow': 'inset 0 0 12px rgba(0, 255, 65, 0.08)',
        'amber-glow': '0 0 12px rgba(255, 179, 0, 0.5)',
        'red-glow':   '0 0 12px rgba(255, 51, 51, 0.5)',
      },
      animation: {
        'blink':        'blink 1.2s step-end infinite',
        'scan':         'scanline 8s linear infinite',
        'flicker':      'flicker 0.15s infinite',
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'pulse-green':  'pulseGreen 2s ease-in-out infinite',
        'type-in':      'typeIn 0.5s steps(20) both',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        scanline: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100vh' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,255,65,0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(0,255,65,0.6), 0 0 40px rgba(0,255,65,0.2)' },
        },
        flicker: {
          '0%':  { opacity: '0.97' },
          '50%': { opacity: '1' },
          '100%':{ opacity: '0.98' },
        },
        typeIn: {
          from: { width: '0' },
          to:   { width: '100%' },
        }
      },
      backgroundImage: {
        'grid-green': `
          linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)
        `,
        'scanlines': `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.15) 2px,
          rgba(0,0,0,0.15) 4px
        )`,
        'term-gradient': 'linear-gradient(180deg, #020c02 0%, #040f04 100%)',
      },
      backgroundSize: {
        'grid': '24px 24px',
      },
      borderColor: {
        DEFAULT: '#1a3a1a',
      },
    },
  },
  plugins: [],
}
