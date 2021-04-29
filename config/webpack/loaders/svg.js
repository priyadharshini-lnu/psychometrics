module.exports = {
  test: /\.r\.svg$/,
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
