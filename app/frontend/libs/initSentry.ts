import * as Sentry from '@sentry/react'
import SentryRRWeb from '@sentry/rrweb'

const initSentry = () => {
  const { sentryUrl, realEnv, currentUser } = window.PsyGlobalState

  Sentry.init({
    dsn: sentryUrl,
    environment: realEnv,
    normalizeDepth: 4,
    integrations: [new SentryRRWeb()],
    ignoreErrors: [
      'Existing connection must be closed before opening',
      'Non-Error promise rejection captured with value: undefined',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      "undefined is not a constructor (evaluating 'new(window.AudioContext||window.webkitAudioContext)')",
      "Cannot read properties of undefined (reading 'received')",
    ],
  })

  Sentry.setUser(currentUser)
}

export default initSentry
