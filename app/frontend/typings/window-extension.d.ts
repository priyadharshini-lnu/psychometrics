export { }

declare global {
  interface Window {
    antdLocale: {}
    PsyGlobalState: {
      realEnv: 'development' | 'review' | 'staging' | 'production'
      sentryClientDns: string,
      currentUser: {
        id: string
        email: string
      }
    }
  }
}
