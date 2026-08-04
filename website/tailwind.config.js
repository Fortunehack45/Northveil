/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0a0c',
          panel: '#141419',
          lime: '#ccff00',
          cyan: '#00f0ff',
          pink: '#ff007f',
          purple: '#7000ff'
        }
      }
    },
  },
  plugins: [],
}
