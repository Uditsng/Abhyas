/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Define custom colors that work well in both light and dark modes
        primary: {
          50: '#e6f1ff',
          100: '#b8d4ff',
          200: '#8ab7ff',
          300: '#5c9aff',
          400: '#2e7dff',
          500: '#0064e6',
          600: '#004fb4',
          700: '#003a82',
          800: '#002551',
          900: '#001021',
        },
      },
    },
  },
  plugins: [],
}
