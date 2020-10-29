import * as Sentry from '@sentry/react'
import SentryRRWeb from '@sentry/rrweb'

enum RealEnvToSentryEnv {
  development = 'heroku-develop',
  review = 'heroku-review',
  staging = 'heroku-staging',
  production = 'heroku-prod',
}

const initSentry = () => {
  const { sentryClientDns, realEnv, currentUser } = window.PsyGlobalState

  Sentry.init({
    dsn: sentryClientDns,
    environment: RealEnvToSentryEnv[realEnv],
    normalizeDepth: 4,
    integrations: [new SentryRRWeb()],
  })

  Sentry.setUser(currentUser)
}

export default initSentry
