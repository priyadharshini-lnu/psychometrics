const { environment, loaders } = require('@rails/webpacker')
const { env } = require('process')
const webpack = require('webpack')
const merge = require('webpack-merge')
const less = require('./loaders/less')

const __DEV__ = env.RAILS_ENV === 'development'
const __TEST__ = env.RAILS_ENV === 'test'
const __PROD__ = env.RAILS_ENV === 'production'

environment.plugins.insert(
  'DefinePlugin',
  new webpack.DefinePlugin(Object.assign({
    __DEV__,
    __TEST__,
    __PROD__,
  })),
)

const myCssLoaderOptions = {
  modules: true,
  localIdentName: env.RAILS_ENV === 'production' ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
}

const CSSLoader = environment.loaders.get('sass').use.find(el => el.loader === 'css-loader')
CSSLoader.options = merge(CSSLoader.options, myCssLoaderOptions)

environment.loaders.append('less', less)

loaders.nodeModules.use[0].options.sourceMaps = true

environment.config.merge({
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
  resolve: {
    symlinks: false,
    alias: {
      videojs: 'video.js',
      'window.videojs': 'video.js',
      RecordRTC: 'recordrtc',
      'window.RecordRTC': 'recordrtc',
    },
  },
  mode: __DEV__ ? 'development' : 'production',
  devtool: 'source-map',
  devServer: {
    inline: false,
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 600,
      ignored: [/node_modules\/(?!survey-ui)/],
    },
  },
})

module.exports = environment
