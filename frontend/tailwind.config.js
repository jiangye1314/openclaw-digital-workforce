/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ma Shan Zheng', 'Indie Flower', 'Caveat', 'cursive'],
        handwriting: ['Ma Shan Zheng', 'Indie Flower', 'Caveat', 'cursive'],
        'handwriting-cn': ['Ma Shan Zheng', 'cursive'],
        'handwriting-en': ['Indie Flower', 'Caveat', 'cursive'],
      },
      colors: {
        paper: {
          white: '#faf8f3',
          cream: '#f5f2e8',
          yellow: '#fef9e7',
          gray: '#f0f0f0',
        },
        ink: {
          primary: '#2c3e50',
          secondary: '#34495e',
          light: '#5d6d7e',
          blue: '#2874a6',
          red: '#c0392b',
          green: '#1e8449',
        },
        line: {
          blue: '#a8d8ea',
          gray: '#d5d5d5',
          red: '#ffb6b9',
        },
        highlight: {
          yellow: '#fff59d',
          pink: '#ffcdd2',
          blue: '#b3e5fc',
        },
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
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'scribble': 'scribble 0.5s ease-in-out',
        'write': 'write 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scribble: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(1px, 1px) rotate(0.5deg)' },
          '50%': { transform: 'translate(-1px, 1px) rotate(-0.5deg)' },
          '75%': { transform: 'translate(1px, -1px) rotate(0.5deg)' },
        },
        write: {
          'from': { opacity: '0', transform: 'translateY(5px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'sketch': '4px 4px 0 rgba(44, 62, 80, 0.15)',
        'sketch-hover': '6px 6px 0 rgba(44, 62, 80, 0.2)',
        'sticky': '2px 3px 8px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'sketch': '3px 8px 5px 12px',
        'sketch-sm': '2px 6px 4px 8px',
      },
    },
  },
  plugins: [],
}
