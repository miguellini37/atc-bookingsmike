/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary color palette (sky blue)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Aviation position type colors
        position: {
          del: '#06b6d4', // Cyan - Delivery
          gnd: '#22c55e', // Green - Ground
          twr: '#3b82f6', // Blue - Tower
          app: '#a855f7', // Purple - Approach
          dep: '#f97316', // Orange - Departure
          ctr: '#ef4444', // Red - Center
          fss: '#6b7280', // Gray - FSS
        },
        // Dark mode specific
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          muted: '#64748b',
        },
      },
      animation: {
        'slide-in': 'slideInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseRing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        skeleton: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backgroundImage: {
        'skeleton-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
