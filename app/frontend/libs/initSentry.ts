import * as Sentry from '@sentry/react'
import SentryRRWeb from '@sentry/rrweb'

const initSentry = () => {
  const { sentryClientDns, realEnv, currentUser } = window.PsyGlobalState

  Sentry.init({
    dsn: sentryClientDns,
    environment: realEnv,
    normalizeDepth: 4,
    integrations: [new SentryRRWeb()],
  })

  Sentry.setUser(currentUser)
}

export default initSentry
