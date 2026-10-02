/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Belanosima', 'sans-serif'],
        belanosima: ['Belanosima', 'sans-serif'],
      },
      colors: {
        antra: {
          dark: '#121214',
          panel: '#1e1e24',
          border: '#2d2d38',
          accent: '#6366f1',
          hover: '#4f46e5'
        }
      }
    },
  },
  plugins: [],
}
