const cores = require('os').cpus().length

module.exports = {
  test: /.(ts|tsx)$/,
  use: [
    {
      loader: 'thread-loader',
      options: {
        workers: cores,
        workerParallelJobs: 50,
      },
    },
    'ts-loader',
  ],
}
