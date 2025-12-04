/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        'neon-green': '#39ff14',
        'dark-bg': '#0d0d0d',
      },
      boxShadow: {
        'neon': '0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14',
        'card': '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 0 2px white',
      },
    },
  },
  plugins: [],
}
