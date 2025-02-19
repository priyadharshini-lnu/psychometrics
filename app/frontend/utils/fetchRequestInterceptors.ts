import { CreateSyncTimeoutChannel } from '~/utils/createSyncTimeoutChannel'

(function () {
  const originalFetch = window.fetch

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args)
    const { currentUser } = window.PsyGlobalState
    const nextTimeout = response.headers.get('x-next-timeout')

    CreateSyncTimeoutChannel.setChannel()
    CreateSyncTimeoutChannel.channel?.postMessage({ userId: currentUser?.id, nextTimeout })

    return response
  }
}())
