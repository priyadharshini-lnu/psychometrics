const cores = require('os').cpus().length

module.exports = {
  test: /.(ts|tsx)$/,
  use: [
    {
      loader: 'thread-loader',
      options: {
        workers: cores / 2,
      },
    },
    {
      loader: 'ts-loader',
      options: {
      },
    },
  ],
}
