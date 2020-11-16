module.exports = {
  test: /.(ts|tsx)$/,
  use: [
    { loader: 'cache-loader' },
    {
      loader: 'thread-loader',
      options: {
        poolTimeout: 30000,
      },
    },
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        happyPackMode: true,
      },
    },
  ],
}
