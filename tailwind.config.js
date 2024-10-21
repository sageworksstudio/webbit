/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/helpers/**/*.rb",
    "./app/javascript/**/*.js",
    './app/assets/stylesheets/**/*.css',
    "./app/views/**/*.erb",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

