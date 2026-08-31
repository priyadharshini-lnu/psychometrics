import { brotliCompress } from 'zlib'
import { promisify } from 'util'
import {defineConfig, ServerOptions} from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import loadCssModulePlugin from './config/vite-plugins/load-css-module'
import videojsRecordCompat from './config/vite-plugins/videojs-record-compat'
import cjsInteropPlugin from './config/vite-plugins/cjs-interop'
import entrySizeBudget from './config/vite-plugins/entry-size-budget'
import gzipPlugin from 'rollup-plugin-gzip'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
// import { visualizer } from "rollup-plugin-visualizer"
import dts from "vite-plugin-dts"
import svgr from 'vite-plugin-svgr'
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { env } from 'process'
import fs from 'fs'

const __DEV__ = env.NODE_ENV === 'development'
const __PROD__ = env.NODE_ENV === 'production'
const __TEST__ = env.NODE_ENV === 'test'
const SSL = env.SSL === 'true'
const SSL_KEY = env.SSL_KEY
const SSL_CERT = env.SSL_CERT

if (SSL) {
  if (!SSL_KEY || !SSL_CERT) {
    throw new Error("You have to specify ENV variables SSL_KEY SSL_CERT")
  }
}

// checker runs on the `typescript` package, which is aliased to the TS 6 API
// (@typescript/typescript6) because vite-plugin-checker can't use TS 7's compiler API yet.
// TODO: remove the @typescript/typescript6 alias once v7 tooling is available.
// Tracking: https://github.com/typescript-eslint/typescript-eslint/issues/10940
const devPlugins = __DEV__ ? [
  dts({
    insertTypesEntry: true,
  }),
  checker({ typescript: true }),
] : []

// Ignore all the files from vendor if it is big and is required just for specific entry point
const IGNORE_VENDORS = [
  '@tensorflow/tfjs-core',
  'powerbi-client',
  'react-pdf',
  '@thetalententerprise/interactive-assessments',
  'dayjs',
  "motion"
]
const server: ServerOptions = SSL ? {
  https: {
    key: fs.readFileSync(SSL_KEY || ''),
    cert: fs.readFileSync(SSL_CERT || ''),
  }
} : {}

const brotliPromise = promisify(brotliCompress)

export default defineConfig({
  server: {
    ...server,
    allowedHosts: [`.${process.env.APP_DOMAIN}`, '.localhost']
  },
  clearScreen: false,
  plugins: [
    videojsRecordCompat(),
    cjsInteropPlugin(['react-froala-wysiwyg', 'react-contenteditable', 'words-count']),
    // 555.7 kB measured with every section split out; the rest is headroom for shell work, not a folded-in page.
    entrySizeBudget({
      entry: 'entrypoints/admin/admin.jsx',
      label: 'The admin app',
      maxKb: 800,
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,

      sourcemaps: {
        filesToDeleteAfterUpload: [
          "./public/vite/**/*.map",
        ]
      },
      debug: process.env.SENTRY_DEBUG === 'true',
    }),
    RubyPlugin(),
    react(),
    // visualizer({open: true}),
    svgr(),
    ...devPlugins,
    loadCssModulePlugin({
      include: (id) => {
        const path = id.split('?').slice(0, 1).join('')
        if (path.endsWith('/ant.less')) { return false }
        if (path.endsWith('/globals.less')) { return false }
        if (path.endsWith('/styles/global.less')) { return false }
        if (path.endsWith('/styles/common.less')) { return false }
        if (path.endsWith('/styles/utils.less')) { return false }
        if (path.endsWith('/admin/style.less')) { return false }

        if (path.endsWith('less') && !path.includes('node_modules')) {
          return true
        }
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: __PROD__ ? '[hash:base64:5]' : '[name]__[local]___[hash:base64:5]',
      localsConvention: 'camelCase',
    },
  },
  build: {
    sourcemap: __TEST__ ? false : true,
    cssMinify: 'esbuild',
    chunkSizeWarningLimit: 5000,
    reportCompressedSize: false,
    cssCodeSplit: true,
    rolldownOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'EVAL') {
          return
        }
        warn(warning)
      },
      plugins: [
        gzipPlugin({
          customCompression: content => brotliPromise(typeof content === 'string' ? content : Uint8Array.from(content)),
          fileName: '.br'
        })
      ],
      output: {
        chunkFileNames: (info) => {
          if (info.name === 'vendors') {
            return 'chunks/vendors-[hash].js'
          }
          return 'chunks/chunk-[hash].js'
        },
        manualChunks(id) {
          // Bundle video.js, videojs-record, and RecordRTC together in a specific chunk
          if (id.includes('node_modules')) {
            if (id.includes('video.js/') || id.includes('videojs-record/') || id.includes('recordrtc/')) {
              return 'videojs-bundle'
            }

            for (let i = 0; i < IGNORE_VENDORS.length; i++) {
              if (id.includes(IGNORE_VENDORS[i])) {
                return
              }
            }
            return 'vendors'
          }

          // if (id.includes('/glint/')) {
          //   return 'glint'
          // }

          // if (id.includes('modules/reports/')) {
          //   return 'survey'
          // }
        }
      }
    },
  },
  optimizeDeps: {
    include: ['react-csv', 'video.js', 'recordrtc', 'react-froala-wysiwyg', 'froala-editor', 'words-count'],
    exclude: ['videojs-record'],
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      "*": './*',
      videojs: 'video.js',
      'window.videojs': 'video.js',
      WaveSurfer: 'wavesurfer.js',
      RecordRTC: 'recordrtc',
      'window.RecordRTC': 'recordrtc',
      ...(__PROD__ ? { 'videojs-record/dist/videojs.record': 'videojs-record/dist/videojs.record.min.js' } : {}),
    },
    extensions: ['.cjs', '.mjs', '.js', '.ts', '.jsx', '.tsx']
  },
  define: {
    __DEV__: __DEV__,
    __PROD__: __PROD__,
    __TEST__: __TEST__,
    __MOCK_SERVER_PORT__: env.MOCK_SERVER_PORT || '3037',
    'process.env': process.env,
  },
})
