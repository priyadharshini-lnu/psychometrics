import { Locale } from 'antd/lib/locale-provider'
/* eslint-disable @typescript-eslint/no-explicit-any */
export { }

declare global {
  interface Window {
    __DEV__: boolean
    __INITIAL_STATE__: any
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    __DISABLE_LOGGER_: boolean
    antdLocale: Locale
    PsyGlobalState: {
      realEnv: string,
      adminLocales:string,
      recaptchaSiteKey:string
      availableAiProviders: string,
      sentryUrl: string,
      sentryDebug: string,
      currentUser: {
        id: string
        email: string
      },
      features: {
        [key: string]: boolean
      },
    },
    Utils: {
      isElementInViewport: (HTMLElement) => boolean
    }
    x_navigation_minimize: (state: string) => null
    $chatwoot: unknnown
    Buffer: unknown
    FaceMesh: unknown
    grecaptcha:{
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
  interface WindowEventMap {
    'local-storage': CustomEvent
  }
  const htmldiff: (s1?: string | null, s2: string) => string
}
