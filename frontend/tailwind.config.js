/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f8fc',
        surface: '#f1f3f8',
        ink: '#141a2a',
        muted: '#697086',
        line: '#e3e6ef',
        navy: '#17213f',
        indigo: '#5b5ce2',
        'indigo-dark': '#4849c7',
        'indigo-soft': '#eeefff',
        coral: '#f1736b',
        success: '#38b789',
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(36, 44, 88, 0.12)',
        panel: '0 18px 50px rgba(36, 44, 88, 0.07)',
      },
    },
  },
  plugins: [],
}
