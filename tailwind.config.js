module.exports = {
  theme: {
    // fontFamily: {
    //   'sans': ['-apple-system', 'BlinkMacSystemFont'],
    //   'serif': ['Georgia', 'Cambria'],
    //   'mono': ['SFMono-Regular', 'Menlo'],
    //   'display': ['Oswald'],
    //   'body': ['Open Sans'],
    // },
    aspectRatio: {
      none: 0,
      square: [1, 1],
      "16/9": [16, 9],
      "4/3": [4, 3],
      "21/9": [21, 9]
    }
  },
  variants: {
    aspectRatio: ['responsive']
  },
  plugins: [
    require("tailwindcss-responsive-embed"),
    require("tailwindcss-aspect-ratio"),
  ]
}