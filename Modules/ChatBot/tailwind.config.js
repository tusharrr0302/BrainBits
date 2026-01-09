/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#0f0f1e',
        'dark-sidebar': '#1a1a2e',
        'dark-card': '#16213e',
        'accent-blue': '#4a90e2',
        'accent-purple': '#6c5ce7',
      },
    },
  },
  plugins: [],
}
