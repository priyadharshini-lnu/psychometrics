import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import I18n from 'i18n-js'
import React from 'react'

global.I18n = I18n
global.React = React

const modules = import.meta.glob('../app/assets/javascripts/administration/i18n/*.js')

await Promise.all(Object.values(modules).map(loader => loader()))

// ref : https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'I18n', {
  value: I18n,
})

Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {

      },
    },
  },
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Fill all need media device properties for test here
Object.defineProperty(window.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValueOnce('mock-media-stream'),
  },
})

// Mock ResizeObserver for Ant Design components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
