import * as Sentry from '@sentry/react'
import SentryRRWeb from '@sentry/rrweb'

const initSentry = () => {
  const { sentryUrl, realEnv, currentUser } = window.PsyGlobalState

  Sentry.init({
    dsn: sentryUrl,
    environment: realEnv,
    normalizeDepth: 4,
    integrations: [new SentryRRWeb()],
  })

  Sentry.setUser(currentUser)
}

export default initSentry
