/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './admin/**/*.{html,js}', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        'rw-black': '#121212',
        'rw-dark': '#1a1a1a',
        'rw-card': '#1e1e1e',
        'rw-red': '#FF0D0D',
        'rw-red-dark': '#CC0A0A',
        'rw-gold': '#D4A853',
        'rw-gold-light': '#E8C97A',
        'rw-gray': '#2a2a2a',
        'rw-text': '#e0e0e0',
        'rw-muted': '#999999',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
