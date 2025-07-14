/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#0052CC', // Primary Blue
          700: '#0747A6',
          800: '#0C4A6E',
          900: '#0C3256',
        },
        teal: {
          500: '#00B8D9', // Secondary Teal
        },
        purple: {
          500: '#6554C0', // Accent Purple
        },
        green: {
          500: '#36B37E', // Success
        },
        amber: {
          500: '#FFAB00', // Warning
        },
        red: {
          500: '#FF5630', // Error
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};