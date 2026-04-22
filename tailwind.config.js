/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8ed',
          100: '#f5edd1',
          200: '#ebdaa3',
          300: '#debf6b',
          400: '#d4af37', // Primary Gold
          500: '#c29b2f',
          600: '#a67c25',
          700: '#865f20',
          800: '#714e20',
          900: '#62421f',
        },
        luxury: {
          black: '#0a0a0a',
          white: '#ffffff',
          cream: '#fdfcf8',
          charcoal: '#1a1a1a',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'fade-out': 'fade-out 0.3s ease-in forwards',
        'zoom-in': 'zoom-in 0.3s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out 0s 2',
      }
    },
  },
  plugins: [],
}
