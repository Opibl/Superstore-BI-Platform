/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 ESTO ES LO QUE FALTABA
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
