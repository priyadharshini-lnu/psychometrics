import { useSessionTimeoutStore } from '~/core/sessionTimeoutStore'


(function () {
  const originalFetch = window.fetch

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args)
    const { currentUser } = window.PsyGlobalState
    const nextTimeout = response.headers.get('x-next-timeout')

    const { setNextTimeoutValue } = useSessionTimeoutStore.getState()
    setNextTimeoutValue(currentUser?.id, nextTimeout)

    return response
  }
}())
