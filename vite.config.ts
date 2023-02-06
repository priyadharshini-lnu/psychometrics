import { brotliCompress } from 'zlib'
import { promisify } from 'util'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import StimulusHMR from 'vite-plugin-stimulus-hmr'
import loadCssModulePlugin from 'vite-plugin-load-css-module'
import gzipPlugin from 'rollup-plugin-gzip'

// import { visualizer } from "rollup-plugin-visualizer"
import dts from "vite-plugin-dts"
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
] : []

// Ignore all the files from vendor if it is big and is required just for specific entry point
const IGNORE_VENDORS = [
  '@tensorflow/tfjs-core',
  'video.js',
  'powerbi-client',
  'react-pdf',
  'moment-timezone',
]
const server = SSL ? {
  https: {
    key: fs.readFileSync(SSL_KEY || ''),
    cert: fs.readFileSync(SSL_CERT || ''),
  }
} : {}

const brotliPromise = promisify(brotliCompress)

export default defineConfig({
  server,
  clearScreen: false,
  plugins: [
    RubyPlugin(),
    StimulusHMR(),
    // visualizer({open: true}),
    ...devPlugins,
    loadCssModulePlugin.default({
      include: (id) => {
        const path = id.split('?').slice(0, 1).join('')
        if (path.endsWith('/ant.less')) { return false }
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
    sourcemap: __DEV__,
    chunkSizeWarningLimit: 5000,
    reportCompressedSize: false,
    rollupOptions: {
      plugins: [gzipPlugin({
        customCompression: content => brotliPromise(Buffer.from(content)),
        fileName: '.br'
      })],
      output: {
        sourcemap: false,
        chunkFileNames: 'chunks/[name]-[hash].js',
        manualChunks(id) {

          if (id.includes('@thetalententerprise/interactive-assessments')) {
            return 'interactive_assessments'
          }

          if (id.includes('node_modules')) {
            for(let i=0;i<IGNORE_VENDORS.length;i++) {
              if (id.includes(IGNORE_VENDORS[i])) {
                return
              }
            }

            return 'vendors'
          }

          // if (id.includes('modules/survey/')) {
          //   return 'survey'
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
  },
})
