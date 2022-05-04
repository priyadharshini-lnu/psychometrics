/* eslint-disable no-underscore-dangle */
const { environment, loaders } = require('@rails/webpacker')
const { env } = require('process')
const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

// Uncomment to activate bundle analyzer
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const lessLoader = require('./loaders/less')
const jsTsLoader = require('./loaders/js-ts')
const svgLoader = require('./loaders/svg')

const DEVTOOL = env.DEVTOOL || false
const __DEV__ = env.NODE_ENV === 'development'
const __TEST__ = env.NODE_ENV === 'test'
const __PROD__ = env.NODE_ENV === 'production'
const __RUN_ESLINT__ = env.RUN_ESLINT === 'true'

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
if (__DEV__) {
  const forkTsCheckerArgs = {
    typescript: {
      diagnosticOptions: {
        semantic: true,
        syntactic: true,
      },
    },
  }

  if (__RUN_ESLINT__) {
    forkTsCheckerArgs.eslint = { files: './app/frontend/**/*.{ts,tsx,js,jsx}' }
  }

  environment.plugins.insert('TsForkChecker', new ForkTsCheckerWebpackPlugin(forkTsCheckerArgs))
}

// Uncomment to activate bundle analyzer
// environment.plugins.insert(
//   'BundleAnalyzerPlugin',
//   new BundleAnalyzerPlugin(),
// )

const myCssLoaderOptions = {
  modules: true,
  localIdentName: __PROD__ ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
}

const CSSLoader = environment.loaders.get('sass').use.find(el => el.loader === 'css-loader')

CSSLoader.options = merge(CSSLoader.options, myCssLoaderOptions)

environment.loaders.append('less', lessLoader)

environment.loaders.append('babel', jsTsLoader)

environment.loaders.append('svgr', svgLoader)

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
  'froala-editor',
  'classnames',
  'prop-types',
  'react-bootstrap',
  'react-overlays',
  'react-select',
  'axios',
  'lodash',
  'redux-logger',
  'action-cable-react',
  'moment',
  'libs/conditions',
  'libs/library',
  'video.js',
  'face-api.js',
  'd3',
  'codemirror',
  'sockjs-client',
  'mime-db',
  'esprima',
  'fbemitter',
  'ajv',
]

const vendors2 = [
  'antd',
  '@ant-design',
  'rc-picker',
  'rc-menu',
  'rc-tree-select',
  'rc-table',
  'rc-tree',
  'rc-tabs',
  'rc-select',
  'rc-animate',
  'rc-slider',
  'rc-field-form',
  'rc-trigger',
  'rc-input-number',
  'rc-drawer',
  'rc-steps',
  'rc-pagination',
  'rc-progress',
  'rc-collapse',
  'rc-notification',
  'rc-virtual-list',
  'rc-mentions',
  'rc-dialog',
  'rc-switch',
  'rc-utils',
  'rc-cascade',
  'babel-runtime',
  'tinycolor2',
  '@tensorflow/tfjs-core',
  'io-ts',
  'fp-ts',
  'history',
  'recordrtc',
  'remarkable',
  'highcharts',
  'autolinker',
  'caniuse-lite',
  '@sentry',
  'crypto-js',
  'rrweb',
  'interact.js',
]

environment.config.merge({
  stats: 'errors-only',
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
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
        adminVendors: {
          chunks: 'initial',
          name: 'vendors2',
          test (mod) {
            if (mod.resource && mod.resource.includes('ant.less')) {
              return true
            }
            if (vendors2.some(str => mod.context && mod.context.includes(str))) {
              return true
            }
            return false
          },
          priority: 999,
        },
        reports: {
          chunks: 'initial',
          name: 'reports',
          test: /modules\/reports/,
          priority: 5,
          enforce: true,
        },
        survey: {
          chunks: 'initial',
          name: 'survey',
          test: /modules\/survey/,
          priority: 5,
          enforce: true,
        },
        interactiveAssessments: {
          chunks: 'initial',
          name: 'interactiveAssessments',
          test: /@thetalententerprise\/interactive-assessments/,
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
      'survey-ui': resolve(__dirname, '..', '..', 'app/frontend/modules/survey'),
      'reports-ui': resolve(__dirname, '..', '..', 'app/frontend/modules/reports'),
    },
  },
  mode: __DEV__ ? 'development' : 'production',
  devtool: DEVTOOL ? 'cheap-module-eval-source-map' : false,
  devServer: {
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 600,
      ignored: [
        /node_modules([\\]+|\/)+(?!jsonapi-react)/,
        /\jsonapi-react([\\]+|\/)node_modules/
      ]
    },
  },
})

module.exports = environment
