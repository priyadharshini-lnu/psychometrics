const { resolve } = require('path')

module.exports = {
  test: /\.svg$/,
  exclude: /(node_modules)/,
  include: [resolve(__dirname, '..', '..', '..', 'app', 'frontend')],
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
