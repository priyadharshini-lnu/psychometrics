import axios from 'axios'
import { useSessionTimeoutStore } from '~/core/sessionTimeoutStore'
import { useExceptionStore } from '~/core/exception'

axios.interceptors.response.use(
  (response) => {
    const { headers } = response
    const { currentUser } = window.PsyGlobalState

    const { setNextTimeoutValue } = useSessionTimeoutStore.getState()
    setNextTimeoutValue(currentUser?.id, headers['x-next-timeout'])
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
