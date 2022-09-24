const TerserPlugin = require('terser-webpack-plugin')

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const environment = require('./environment')

environment.config.merge({
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: Number(process.env.THREAD_LOADER_WORKERS),
        sourceMap: false,
      }),
    ],
  }
})

module.exports = environment.toWebpackConfig()
