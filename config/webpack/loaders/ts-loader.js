module.exports = {
  test: /.(ts|tsx)$/,
  use: [
    { loader: 'cache-loader' },
    {
      loader: 'thread-loader',
      options: {
        poolTimeout: Infinity,
      },
    },
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  ],
}
