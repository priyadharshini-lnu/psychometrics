const { resolve } = require('path')

module.exports = {
  test: /\.(js|jsx|ts|tsx)?$/,
  exclude: /(node_modules)/,
  include: [
    resolve(__dirname, '..', '..', '..', 'app', 'frontend'),
  ],
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: resolve(__dirname, '..', '..', '..', 'tmp', 'cache', 'webpacker'),
      },
    },
  ],
}
