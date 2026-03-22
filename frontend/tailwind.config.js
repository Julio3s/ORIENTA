/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'serif'],
      },
      colors: {
        blue: {
          950: '#0A1628',
          900: '#0F2044',
          800: '#1E3A8A',
          700: '#1D4ED8',
          600: '#2563EB',
          500: '#3B82F6',
          400: '#60A5FA',
          300: '#93C5FD',
          100: '#DBEAFE',
          50:  '#EFF6FF',
        }
      }
    },
  },
  plugins: [],
}