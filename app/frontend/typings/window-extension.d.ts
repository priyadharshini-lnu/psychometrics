import { Locale } from 'antd/es/locale'
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
      clientContextData?: {
        id: number
        name: string
        subdomain: string
        logo_url?: string | null
        sso_enabled?: boolean
        sso_enforced?: boolean
      } | null
      switchableClients?: {
        id: number
        name: string
        subdomain: string
        logo_url?: string | null
        sso_enforced?: boolean
        has_active_session: boolean
      }[]
      recentClientIds?: number[]
      impersonationData?: {
        impersonator: { id: number; email: string; name: string }
        target: { id: number; email: string; name: string; role: string }
      } | null
    },
    Utils: {
      isElementInViewport: (HTMLElement) => boolean
    }
    x_navigation_minimize: (state: string) => null
    $chatwoot: unknnown
    Buffer: unknown
    FaceMesh: unknown
    grecaptcha: {
      ready: (callback: () => void) => void
      render: (
        container: string | HTMLElement,
        parameters: {
          sitekey: string
          size: 'invisible'
          callback: (token: string) => void
        }
      ) => number
      execute: (widgetId?: number) => void
    }
    Osano?: {
      cm: {
        dialogOpen: boolean
        addEventListener: (event: string, callback: (...args: any[]) => void) => void
        removeEventListener: (event: string, callback: (...args: any[]) => void) => void
        showDrawer: (trigger?: string) => void
        showDialog: () => void
        hideDialog: () => void
      }
    }
  }
  interface WindowEventMap {
    'local-storage': CustomEvent
  }
  const htmldiff: (s1?: string | null, s2: string) => string
}
