import { useLocalStorageStore } from '~/core/extendSession'


(function () {
  const originalFetch = window.fetch

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args)

    const nextTimeout = response.headers.get('x-next-timeout')

    const { setNextTimeoutValue } = useLocalStorageStore.getState()
    setNextTimeoutValue(nextTimeout)

    return response
  }
}())
