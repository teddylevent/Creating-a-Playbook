/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0a1a',
          card: '#12122a',
          border: '#2a2a4a',
          accent: '#7c3aed',
          gold: '#f59e0b',
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        display: ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
