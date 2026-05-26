/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{jsx,js}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf7ed',
          100: '#f5edcf',
          200: '#ebd99b',
          300: '#dfc163',
          400: '#d4aa3a',
          500: '#c9992c',
          600: '#a87823',
          700: '#8c581f',
          800: '#754822',
          900: '#653d20',
        },
        brown: {
          50: '#faf6f1',
          100: '#f2e8d8',
          200: '#e3cfaf',
          300: '#d3b181',
          400: '#c6945d',
          500: '#bb7f49',
          600: '#a5663d',
          700: '#8a4f34',
          800: '#6b3a2a',
          900: '#5b3326',
        },
        rose: {
          50: '#fdf2f0',
          100: '#fce2dc',
          200: '#fac9bd',
          300: '#f5a693',
          400: '#ee7b60',
          500: '#e85d3d',
          600: '#d94422',
          700: '#c43619',
          800: '#a32f1b',
          900: '#872b1c',
        },
        offwhite: '#f5f0e8',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
