/* eslint-disable @typescript-eslint/no-explicit-any */
export { }

declare global {
  interface Window {
    __DEV__: boolean
    __INITIAL_STATE__: any
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    __DISABLE_LOGGER_: boolean
    antdLocale: {}
    PsyGlobalState: {
      realEnv: 'development' | 'review' | 'staging' | 'production'
      sentryClientDns: string,
      currentUser: {
        id: string
        email: string
      }
    }
    x_navigation_minimize: (state: string) => null
  }
}
