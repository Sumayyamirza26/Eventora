/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        eventora: {
          plum: '#292331',
          porcelain: '#F7F5F0',
          white: '#FFFFFF',
          violet: '#625078',
          citron: '#D6E59A',
          lilac: '#E7E2E9',
          success: '#356548',
          warning: '#875B18',
          error: '#A34235',
          info: '#485A99',
        },
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .6s ease-out both',
        float: 'float 7s ease-in-out infinite',
        pop: 'pop .25s ease-out both',
      },
    },
  },
  plugins: [],
};
