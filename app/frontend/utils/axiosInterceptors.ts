import axios from 'axios'
import { CreateSyncTimeoutChannel } from '~/utils/createSyncTimeoutChannel'
import { useExceptionStore } from '~/core/exception'

axios.interceptors.response.use(
  (response) => {
    const { headers } = response
    const { currentUser } = window.PsyGlobalState

    CreateSyncTimeoutChannel.setChannel()
    CreateSyncTimeoutChannel.channel?.postMessage({ userId: currentUser?.id, nextTimeout: headers['x-next-timeout'] })
    return response
  },
  (error) => {
    if (error.response && error.response.status === 500 && error.response.data && error.response.data.exception) {
      const { setException } = useExceptionStore.getState()
      setException(error.response.data)
    }
    return Promise.reject(error)
  },
)
