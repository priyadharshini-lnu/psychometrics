const cores = require('os').cpus().length

module.exports = {
  test: /.(ts|tsx)$/,
  use: [
    { loader: 'cache-loader' },
    {
      loader: 'thread-loader',
      options: {
        workers: cores - 1,
        poolTimeout: Infinity,
      },
    },
    {
      loader: 'ts-loader',
      options: {
        happyPackMode: true,
        transpileOnly: true,
      },
    },
  ],
}
