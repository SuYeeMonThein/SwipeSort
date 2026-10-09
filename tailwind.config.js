/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF6E5',
        sky: '#7EC8F2',
        sun: '#FFC93C',
        coral: '#FF6B6B',
        ink: '#3B2A20',
        recycle: '#3DDC84',
        trash: '#6B7280',
        compost: '#B5651D',
        ewaste: '#9B5CFF',
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
