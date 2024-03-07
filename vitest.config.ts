import { env } from 'process'
import { URL } from 'url'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import loadCssModulePlugin from 'vite-plugin-load-css-module'

const __DEV__ = env.NODE_ENV === 'development'
const __PROD__ = env.NODE_ENV === 'production'
const __TEST__ = env.NODE_ENV === 'test'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    loadCssModulePlugin.default({
      include: (id) => {
        const path = id.split('?').slice(0, 1).join('')
        if (path.endsWith('/ant.less')) { return false }
        if (path.endsWith('/globals.less')) { return false }
        if (path.endsWith('less') && !path.includes('node_modules')) {
          return true
        }
      },
    }),
  ],
  test: {
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },
    setupFiles: './config/vitest-setup.ts',
    environment: 'jsdom',
    // TODO: remove include prop after complete Vitest migration
    // include: ['app/frontend/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['public/**/*', 'config/**/*', 'node_modules/**/*'],
    coverage: {
      all: false,
      reporter: ['lcov', 'text'],
      include: ['app/frontend/**/*.{js,jsx,ts,tsx}'],
    },
    outputFile: 'coverage/sonar-report.xml',
    globals: true,
    alias: {
      '*': './*',
      '@/': new URL('./app/frontend/', import.meta.url).pathname,
      '~/': new URL('./app/frontend/', import.meta.url).pathname,
      videojs: 'video.js',
      'window.videojs': 'video.js',
      WaveSurfer: 'wavesurfer.js',
      RecordRTC: 'recordrtc',
      'window.RecordRTC': 'recordrtc',
    },
  },
  define: {
    __DEV__,
    __PROD__,
    __TEST__,
    __MOCK_SERVER_PORT__: env.MOCK_SERVER_PORT || '3037',
    'process.env': process.env,
  },
})
