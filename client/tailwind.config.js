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
        },
        // Modern Soft Pastel & Accent Palette
        lavender: {
          50: '#F5F7FF',
          100: '#EBF0FE',
          200: '#D6E0FD',
          300: '#B4C6FC',
          400: '#8DA6F9',
          500: '#6366F1',
          600: '#4F46E5',
        },
        mint: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981',
          600: '#059669',
        },
        peach: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(15, 23, 42, 0.12), 0 8px 16px -3px rgba(15, 23, 42, 0.06)',
        'soft-xl': '0 24px 48px -12px rgba(15, 23, 42, 0.15)',
        'glow-blue': '0 0 24px rgba(59, 130, 246, 0.25)',
        'glow-purple': '0 0 24px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      }
    },
  },
  plugins: [],
}
