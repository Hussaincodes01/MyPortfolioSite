/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Tight', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        void: 'var(--void)',
        trace: 'var(--trace)',
        bone: 'var(--bone)',
        slate: 'var(--slate)',
      },
    },
  },
  plugins: [],
}
