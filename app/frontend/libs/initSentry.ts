import * as Sentry from '@sentry/react'

const initSentry = () => {
  const { sentryUrl, realEnv, currentUser } = window.PsyGlobalState
  if (Sentry.isInitialized()) return
  Sentry.init({
    dsn: sentryUrl,
    environment: realEnv,
    normalizeDepth: 4,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      })],
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
