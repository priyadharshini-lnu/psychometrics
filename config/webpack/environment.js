const { environment, loaders } = require('@rails/webpacker')
const { env } = require('process')
const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const less = require('./loaders/less')
const tsLoader = require('./loaders/ts-loader')

const __DEV__ = env.NODE_ENV === 'development'
const __TEST__ = env.NODE_ENV === 'test'
const __PROD__ = env.NODE_ENV === 'production'

environment.plugins.insert(
  'DefinePlugin',
  new webpack.DefinePlugin(Object.assign({
    __DEV__,
    __TEST__,
    __PROD__,
    __DISABLE_LOGGER_: env.DISABLE_LOGGER || false,
  })),
)
environment.plugins.insert(
  'ProvidePlugin',
  new webpack.ProvidePlugin({
    videojs: 'video.js/dist/video.cjs.js',
    RecordRTC: 'recordrtc',
  }),
)

const myCssLoaderOptions = {
  modules: true,
  localIdentName: env.NODE_ENV === 'production' ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
}

const CSSLoader = environment.loaders.get('sass').use.find(el => el.loader === 'css-loader')
CSSLoader.options = merge(CSSLoader.options, myCssLoaderOptions)

environment.loaders.append('less', less)
environment.loaders.append('typescript', tsLoader)

loaders.nodeModules.use[0].options.sourceMaps = true

const vendors = [
  'react',
  'react-dom',
  'react-dnd',
  'redux',
  'reselect',
  'react-dnd-html5-backend',
  'react-dnd-touch-backend',
  'react-froala-wysiwyg',
  'classnames',
  'prop-types',
  'react-bootstrap',
  'react-overlays',
  'react-select',
  'axios',
  'lodash',
  'antd',
  'redux-logger',
  'action-cable-react',
  'react-addons-update',
  'moment',
  'libs/conditions',
  'libs/library',
]

environment.config.merge({
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          name: 'vendors',
          test (mod) {
            if (vendors.some(str => mod.context && mod.context.includes(str))) {
              return true
            }
            return false
          },
          priority: 999,
        },
        reports: {
          chunks: 'initial',
          name: 'reports',
          test: /libs\/reports/,
          priority: 5,
          enforce: true,
        },
        survey: {
          chunks: 'initial',
          name: 'survey',
          test: /libs\/survey/,
          priority: 5,
          enforce: true,
        },

      },
    },
  },
  resolve: {
    symlinks: false,
    alias: {
      videojs: 'video.js',
      'window.videojs': 'video.js',
      WaveSurfer: 'wavesurfer.js',
      RecordRTC: 'recordrtc',
      'window.RecordRTC': 'recordrtc',
      'survey-ui': resolve(__dirname, '..', '..', 'app/frontend/libs/survey'),
      'reports-ui': resolve(__dirname, '..', '..', 'app/frontend/libs/reports'),
    },
  },
  mode: __DEV__ ? 'development' : 'production',
  devtool: 'source-map',
  devServer: {
    inline: false,
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 600,
    },
  },
})

module.exports = environment
