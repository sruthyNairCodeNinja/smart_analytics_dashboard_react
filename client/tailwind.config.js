/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        factory: {
          50: '#f0f6ff',
          100: '#dceaff',
          500: '#2f6feb',
          600: '#2557c7',
          700: '#1d439a',
          900: '#122a5e',
        },
      },
    },
  },
  plugins: [],
};
