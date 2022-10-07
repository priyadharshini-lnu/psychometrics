/* eslint-disable no-underscore-dangle */
const { environment, loaders } = require('@rails/webpacker')
const { env } = require('process')
const { resolve } = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

// Uncomment to activate bundle analyzer
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const threadLoader = require('./loaders/thread-loader')
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
// if (__DEV__) {
//   environment.plugins.insert(
//     'BundleAnalyzerPlugin',
//     new BundleAnalyzerPlugin(),
//   )
// }

environment.loaders.append('thread-loader', threadLoader)
environment.loaders.append('less', lessLoader.withModules)
environment.loaders.append('lessGlobals', lessLoader.withoutModules)
environment.loaders.append('babel', jsTsLoader)
environment.loaders.append('svgr', svgLoader)

loaders.nodeModules.use[0].options.sourceMaps = true

const vendors = [
  'node_modules/react',
  'node_modules/react-dom',
  'node_modules/react-dnd',
  'node_modules/redux',
  'node_modules/reselect',
  'node_modules/react-dnd-html5-backend',
  'node_modules/react-dnd-touch-backend',
  'node_modules/react-froala-wysiwyg',
  'node_modules/froala-editor',
  'node_modules/classnames',
  'node_modules/prop-types',
  'node_modules/react-bootstrap',
  'node_modules/react-overlays',
  'node_modules/react-select',
  'node_modules/axios',
  'node_modules/lodash',
  'node_modules/redux-logger',
  'node_modules/action-cable-react',
  'node_modules/moment',
  'frontend/libs/conditions',
  'frontend/libs/library',
  'node_modules/video.js',
  'node_modules/face-api.js',
  'node_modules/d3',
  'node_modules/codemirror',
  'node_modules/sockjs-client',
  'node_modules/mime-db',
  'node_modules/esprima',
  'node_modules/fbemitter',
  'node_modules/ajv',
  'node_modules/jsonpath',
]

const vendors2 = [
  'node_modules/antd',
  'node_modules/@ant-design',
  'node_modules/rc-picker',
  'node_modules/rc-menu',
  'node_modules/rc-tree-select',
  'node_modules/rc-table',
  'node_modules/rc-tree',
  'node_modules/rc-tabs',
  'node_modules/rc-select',
  'node_modules/rc-animate',
  'node_modules/rc-slider',
  'node_modules/rc-field-form',
  'node_modules/rc-trigger',
  'node_modules/rc-input-number',
  'node_modules/rc-drawer',
  'node_modules/rc-steps',
  'node_modules/rc-pagination',
  'node_modules/rc-progress',
  'node_modules/rc-collapse',
  'node_modules/rc-notification',
  'node_modules/rc-virtual-list',
  'node_modules/rc-mentions',
  'node_modules/rc-dialog',
  'node_modules/rc-switch',
  'node_modules/rc-utils',
  'node_modules/rc-cascade',
  'node_modules/babel-runtime',
  'node_modules/tinycolor2',
  'node_modules/@tensorflow/tfjs-core',
  'node_modules/io-ts',
  'node_modules/fp-ts',
  'node_modules/history',
  'node_modules/recordrtc',
  'node_modules/remarkable',
  'node_modules/highcharts',
  'node_modules/autolinker',
  'node_modules/caniuse-lite',
  'node_modules/@sentry',
  'node_modules/crypto-js',
  'node_modules/rrweb',
  'node_modules/interact.js',
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
            if (mod.resource && mod.resource.includes('styles/ant.less')) {
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
        /node_modules([\\]+|\/)+(?!@thetalententerprise\/jsonapi-react)/,
        /\jsonapi-react([\\]+|\/)node_modules/
      ]
    },
  },
})

module.exports = environment
