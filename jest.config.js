/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
  roots: ['<rootDir>/app/frontend', '<rootDir>/app/frontend/modules/survey'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/app/frontend/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/app/frontend/__mocks__/svg.js',
    '\\.(scss|less)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/config/jest-setup.js'],
  preset: 'ts-jest',
  moduleDirectories: [
    'node_modules',
    'app/frontend',
    'app/frontend/modules/survey',
    'app/frontend/modules/reports',
  ],
  collectCoverageFrom: [
    'app/frontend/**/*.{ts,tsx,js,jsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'app/frontend/__tests__/',
    'app/frontend/__mocks__/',
    'app/frontend/packs/',
    'app/frontend/typings/',
  ],
  globals: {
    window: {},
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
