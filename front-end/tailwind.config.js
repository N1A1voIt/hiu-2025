/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      colors: {
        terracotta: 'rgb(116,127,100)',
        oliveGreen: 'rgb(203,122,91)',
        cream: 'rgb(232,226,216)',
        slateBlue: 'rgb(92,117,122)',
      }
    },
  },
  plugins: [],
}
