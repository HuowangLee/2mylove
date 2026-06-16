/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmos: {
          950: '#05050b',
          900: '#070712',
          800: '#0c0c1f',
        },
      },
      boxShadow: {
        'glass-sm': '0 8px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}


