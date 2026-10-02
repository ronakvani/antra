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
          ivory: '#F8F4E6',
          cherry: '#FEF4F4',
          plum: '#F2A0A1',
          crimson: '#E95464',
          dark: '#0e0e11',
          panel: '#18181c',
          border: '#26262c',
          accent: '#E95464',
          hover: '#d44353'
        }
      }
    },
  },
  plugins: [],
}
