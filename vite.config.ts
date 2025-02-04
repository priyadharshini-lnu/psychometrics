import { brotliCompress } from 'zlib'
import { promisify } from 'util'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import loadCssModulePlugin from 'vite-plugin-load-css-module'
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

const devPlugins = __DEV__ ? [
  dts({
    insertTypesEntry: true,
  }),
  checker({typescript: true}),
] : []

// Ignore all the files from vendor if it is big and is required just for specific entry point
const IGNORE_VENDORS = [
  '@tensorflow/tfjs-core',
  'video.js',
  'powerbi-client',
  'react-pdf',
  '@thetalententerprise/interactive-assessments',
  'dayjs'
]
const server = SSL ? {
  https: {
    key: fs.readFileSync(SSL_KEY || ''),
    cert: fs.readFileSync(SSL_CERT || ''),
  }
} : {}

const brotliPromise = promisify(brotliCompress)

export default defineConfig({
  server:{
    ...server,
    allowedHosts: ['.ttedev.me'],
  },
  clearScreen: false,
  plugins: [
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
    svgr({
      exportAsDefault: false,
    }),
    ...devPlugins,
    loadCssModulePlugin.default({
      include: (id) => {
        const path = id.split('?').slice(0, 1).join('')
        if (path.endsWith('/ant.less')) { return false }
        if (path.endsWith('/globals.less')) { return false }
        if (path.endsWith('/styles/global.less')) { return false }
        if (path.endsWith('/styles/common.less')) { return false }
        if (path.endsWith('/styles/utils.less')) { return false }

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
  esbuild: {
    sourcemap: 'external',
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 5000,
    reportCompressedSize: false,
    cssCodeSplit: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'EVAL') {
          return
        }
        warn(warning)
      },
      plugins: [
        gzipPlugin({
          customCompression: content => brotliPromise(Buffer.from(content)),
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
          if (id.includes('node_modules')) {
            for(let i=0;i<IGNORE_VENDORS.length;i++) {
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
    include: ['react-csv'],
    esbuildOptions: {
      loader: {
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
