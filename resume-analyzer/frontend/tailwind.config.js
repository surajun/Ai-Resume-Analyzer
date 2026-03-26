/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d4ff',
          300: '#9db5ff',
          400: '#7090ff',
          500: '#4a6cff',
          600: '#2e4bff',
          700: '#1f35eb',
          800: '#1a2bbd',
          900: '#1c2a94',
          950: '#131a5e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          900: '#0f1729',
          950: '#080d1a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'score-fill': 'scoreFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scoreFill: { from: { 'stroke-dashoffset': '339' }, to: {} },
      },
    },
  },
  plugins: [],
};
