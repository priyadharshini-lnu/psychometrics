export { }

declare global {
  interface Window {
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
