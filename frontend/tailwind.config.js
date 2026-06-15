/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        army: {
          dark: '#0e1a0e',
          deep: '#162416',
          green: '#1e3a1e',
          mid: '#2a5c2a',
          bright: '#3d8b3d',
          light: '#5faf5f',
        },
        gold: {
          DEFAULT: '#c9a84c',
          bright: '#f0c040',
          dim: '#8a6f2e',
        },
        cream: {
          DEFAULT: '#f5f0e0',
          dim: '#e0d9c5',
        },
        ncc: {
          red: '#c0392b',
          'red-light': '#e74c3c',
          'green-ok': '#27ae60',
          'green-ok-light': '#2ecc71',
          surface: '#0c1409',
          muted: '#7a8870',
          dim: '#3e4a3a',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        heading: ['Oswald', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '22px',
      },
      backdropBlur: {
        glass: '12px',
        'glass-heavy': '18px',
      },
      animation: {
        'orb-float': 'orbFloat 18s ease-in-out infinite alternate',
        'orb-float-reverse': 'orbFloat 22s ease-in-out infinite alternate-reverse',
        'orb-float-slow': 'orbFloat 26s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'scroll-bounce': 'scrollBounce 2s ease-in-out infinite',
        'page-in': 'pageIn 0.4s ease both',
        'spin-slow': 'spin 0.7s linear infinite',
        'fade-up': 'fadeUp 0.6s ease both',
      },
      keyframes: {
        orbFloat: {
          '0%': { transform: 'translate(0,0)' },
          '100%': { transform: 'translate(40px, 30px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(8px)' },
        },
        pageIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.34,1.56,0.64,1)',
        'ease-smooth': 'cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
}
