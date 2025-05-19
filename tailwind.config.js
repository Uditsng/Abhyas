/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Add Tremor components
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"
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
        // Tremor color palette
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#6b7280", // gray-500
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
      },
    },
  },
  safelist: [
    {
      pattern: /^(bg|text|border|ring)-tremor-/,
    },
    {
      pattern: /^tremor-/,
    },
  ],
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

