/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
  roots: [
    '<rootDir>/app/frontend',
    '<rootDir>/app/frontend/modules/survey',
  ],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
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
  globals: {
    window: {},
    __DEV__: {},
    __TEST__: {},
    __PROD__: {},
    __DISABLE_LOGGER_: {},
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
}
