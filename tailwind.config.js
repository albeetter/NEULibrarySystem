// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec", 
        "background-light": "#f6f6f8",
        "background-dark": "#111318", // Updated to match the deeper admin background
        "surface-dark": "#1d212a",    // New card background
        "border-dark": "#2a303c",     // New border color
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}