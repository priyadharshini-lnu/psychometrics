const { resolve } = require('path')
const { cpus } = require('os')

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
        workers: process.env.THREAD_LOADER_WORKERS,
      },
    },
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: resolve(__dirname, '..', '..', '..', 'tmp', 'cache', 'webpacker'),
      },
    },
  ],
}
