module.exports = {
  roots: [
    '<rootDir>/app/frontend',
    '<rootDir>/app/frontend/libs/survey',
  ],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  preset: 'ts-jest',
  moduleDirectories: [
    'node_modules',
    'app/frontend',
    'app/frontend/libs/survey',
  ],
  globals: {
    window: {},
    __DEV__: {},
    __TEST__: {},
    __PROD__: {},
    __DISABLE_LOGGER_: {},
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
}
