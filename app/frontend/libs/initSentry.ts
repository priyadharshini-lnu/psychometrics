import * as Sentry from '@sentry/react'

enum RealEnvToSentryEnv {
  development = 'heroku-develop',
  review = 'heroku-review',
  staging = 'heroku-staging',
  production = 'heroku-prod',
}

const intiSentry = () => {
  const { sentryClientDns, realEnv, currentUser } = window.PsyGlobalState

  Sentry.init({
    dsn: sentryClientDns,
    environment: RealEnvToSentryEnv[realEnv],
    normalizeDepth: 8,
  })

  Sentry.setUser(currentUser)
}

export default intiSentry
