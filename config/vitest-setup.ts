import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import I18n from 'i18n-js'
import React from 'react'

global.I18n = I18n
global.React = React

// React 18 needs this flag for act() to batch updates instead of warning.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const modules = import.meta.glob('../app/assets/javascripts/administration/i18n/*.js')

await Promise.all(Object.values(modules).map(loader => loader()))

// ref : https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'I18n', {
  value: I18n,
})

window.PsyGlobalState = {
  realEnv: 'test',
  brand: 'marsh',
  supportEmail: 'mte.surveys@mercer.com',
  adminLocales: '',
  recaptchaSiteKey: '',
  availableAiProviders: '',
  sentryUrl: '',
  sentryDebug: 'false',
  currentUser: { id: '', email: '' },
  features: {},
  clientContextData: null,
  switchableClients: [],
  recentClientIds: [],
  impersonationData: null,
}

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

// jsdom has no pseudo-element styles, so antd's scrollbar probe ('::-webkit-scrollbar') throws.
const nativeGetComputedStyle = window.getComputedStyle.bind(window)

window.getComputedStyle = (element: Element, pseudoElement?: string | null) => (
  pseudoElement ? document.createElement('div').style : nativeGetComputedStyle(element)
)

// Mock ResizeObserver for Ant Design components
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
