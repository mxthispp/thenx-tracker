/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#090D16', 900: '#090D16', 850: '#0D1320', 800: '#111827', 700: '#1A2233', 600: '#252F44', 500: '#334056' },
        thenx: { DEFAULT: '#EF4444', dark: '#B91C1C', glow: '#F87171' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(239,68,68,0.55)',
        'glow-emerald': '0 0 40px -10px rgba(16,185,129,0.6)',
      },
    },
  },
  plugins: [],
};
