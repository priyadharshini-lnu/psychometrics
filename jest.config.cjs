/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
  roots: ['<rootDir>/app/frontend'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/app/frontend/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)',
    '<rootDir>/app/frontend/glint/components/**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  cacheDirectory: '<rootDir>/tmp/cache/jest',
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/app/frontend/__mocks__/svg.js',
    '\\.(scss|less)$': 'identity-obj-proxy',
    '~/(.*)': '<rootDir>/app/frontend/$1',
  },
  transform: {
    '\\.js$': ['babel-jest', { configFile: './babel-jest.config.cjs' }],
    '\\.[jt]sx?$': ['babel-jest', { configFile: './babel-jest.config.cjs' }],
  },
  setupFilesAfterEnv: ['<rootDir>/config/jest-setup.js'],
  preset: 'ts-jest',
  moduleDirectories: [
    'node_modules',
    'app/frontend',
    './app/frontend',
  ],
  collectCoverageFrom: [
    'app/frontend/**/*.{ts,tsx,js,jsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'app/frontend/__tests__/',
    'app/frontend/__mocks__/',
    'app/frontend/entrypoints/',
    'app/frontend/typings/',
  ],
  globals: {
    __DEV__: {},
    __TEST__: {},
    __PROD__: {},
    __DISABLE_LOGGER_: {},
    'ts-jest': {
      babelConfig: true,
      tsconfig: 'tsconfig.json',
    },
  },
}
