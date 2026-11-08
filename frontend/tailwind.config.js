/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emergency: {
          bg: '#2a0b12',
          card: '#3d101b',
          border: '#ef4444'
        }
      }
    }
  },
  plugins: []
};