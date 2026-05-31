/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        app: 'rgb(var(--app-bg) / <alpha-value>)',
        'app-ink': 'rgb(var(--app-ink) / <alpha-value>)',
        'app-line': 'rgb(var(--app-line) / <alpha-value>)',
        'app-accent': 'rgb(var(--app-accent) / <alpha-value>)',
        'app-accent-2': 'rgb(var(--app-accent-2) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
