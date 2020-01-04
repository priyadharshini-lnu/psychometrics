module.exports = {
  roots: [
    '<rootDir>/app/frontend',
    '<rootDir>/app/frontend/libs/survey',
  ],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: [
    'node_modules',
    'app/frontend',
    'app/frontend/libs/survey',
  ],
  globals: {
    'ts-jest': {
      module: 'commonjs',
    },
  },
}
