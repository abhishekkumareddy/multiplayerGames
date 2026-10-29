/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          navy: '#0A0F1D',
          dark: '#111827',
          card: '#1F2937',
          surface: '#1A2234',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          yellow: '#F59E0B',
          coral: '#EF4444',
          purple: '#8B5CF6',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        arcade: ['"Press Start 2P"', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.7))' },
        }
      }
    },
  },
  plugins: [],
}
