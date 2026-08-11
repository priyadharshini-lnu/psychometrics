import { env } from 'process'
import { URL } from 'url'
import { defineConfig } from 'vitest/config'
import loadCssModulePlugin from './config/vite-plugins/load-css-module'

const __DEV__ = env.NODE_ENV === 'development'
const __PROD__ = env.NODE_ENV === 'production'
const __TEST__ = env.NODE_ENV === 'test'

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    loadCssModulePlugin({
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
    exclude: ['public/**/*', 'config/**/*', 'node_modules/**/*', 'storybook/**/*'],
    coverage: {
      reporter: ['lcov', 'text'],
      include: ['app/frontend/**/*.{js,jsx,ts,tsx}'],
    },
    outputFile: 'coverage/sonar-report.xml',
    globals: true,
    alias: {
      // The tsconfig .d.ts alias is types-only, but tsconfigPaths applies it at runtime; use the built module.
      '@thetalententerprise/glint/icons': new URL(
        './node_modules/@thetalententerprise/glint/dist/icons/entry.js', import.meta.url,
      ).pathname,
      // scroll-js resolves to a CJS entry that requires an undeclared core-js; use its ESM build.
      'scroll-js': new URL('./node_modules/scroll-js/dist/scroll.js', import.meta.url).pathname,
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
