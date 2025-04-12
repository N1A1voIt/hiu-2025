/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        oliveGreen: 'rgb(116,127,100)',
        darkGreen: 'rgb(71,81,50)',
        terracotta: 'rgb(203,122,91)',
        cream: 'rgb(232,226,216)',
        slateBlue: 'rgb(92,117,122)',
      }
    },
  },
  plugins: [],
}
