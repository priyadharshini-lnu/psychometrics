module.exports = {
  test: /\.svgr$/,
  use: [
    {
      loader: '@svgr/webpack',
      options: {
        icon: true,
        titleProp: true,
      },
    },
  ],
}
