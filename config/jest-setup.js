require('@testing-library/jest-dom')
const I18n = require('i18n-js')
const React = require('react')

global.I18n = I18n
global.React = React

require('../app/assets/javascripts/administration/i18n/translations.js')
jest.mock('~/modules/reports/cable/Cable.js')
jest.mock('~/modules/survey/cable/Cable.js')

// ref : https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'I18n', {
  value: I18n
})

Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {

      }
    }
  }
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Fill all need media device properties for test here
Object.defineProperty(window.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValueOnce('mock-media-stream'),
  },
})
