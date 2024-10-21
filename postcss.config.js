module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('tailwindcss/nesting'),
    require('autoprefixer'),
    require("postcss-nested"),
    require("postcss-flexbugs-fixes"),
  ],
}
