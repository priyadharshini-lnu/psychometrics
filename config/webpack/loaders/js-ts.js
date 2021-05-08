const { resolve } = require('path')

module.exports = {
  test: /\.(js|jsx|ts|tsx)?$/,
  exclude: /(node_modules)/,
  include: [
    resolve(__dirname, '..', '..', '..', 'app', 'frontend'),
  ],
  use: [
    {
      loader: 'thread-loader',
      options: {
        poolTimeout: 30000,
      },
    },
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    },
  ],
}
