/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B1A2E', 2: '#12243D', 3: '#1B3150', line: '#2A4366' },
        cream: { DEFAULT: '#F2E6D0', dim: '#B9AE9A', faint: '#7E7868' },
        artemis: '#F26A1F',
        life: 'var(--c-good)',
        warn: 'var(--c-warn)',
        danger: 'var(--c-bad)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
};
