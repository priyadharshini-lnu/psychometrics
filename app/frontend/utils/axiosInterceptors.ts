import axios from 'axios'
import { CreateSyncTimeoutChannel } from '~/utils/createSyncTimeoutChannel'
import { useExceptionStore } from '~/core/exception'
import { CLIENT_ERRORS } from '~/components/ErrorModal/ErrorModal'
import { ClientErrorStatus, setRequestErrors } from '~/core/errors'
import adminStore from '~/modules/admin/store'
import clientStore from '~/modules/endUser/store'
import surveyStore from '~/modules/survey/store'

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
    if (CLIENT_ERRORS.includes(String(error.response.status))) {
      adminStore.dispatch(setRequestErrors('axios', String(error.response.status) as ClientErrorStatus))
      clientStore.dispatch(setRequestErrors('axios', String(error.response.status) as ClientErrorStatus))
      surveyStore.dispatch(setRequestErrors('axios', String(error.response.status) as ClientErrorStatus))
    }
    return Promise.reject(error)
  },
)
