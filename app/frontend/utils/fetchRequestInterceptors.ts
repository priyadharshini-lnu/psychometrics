import { CreateSyncTimeoutChannel } from '~/utils/createSyncTimeoutChannel'
import { CLIENT_ERRORS } from '~/components/ErrorModal/ErrorModal'
import { ClientErrorStatus, setRequestErrors } from '~/core/errors'
import adminStore from '~/modules/admin/store'
import clientStore from '~/modules/endUser/store'
import surveyStore from '~/modules/survey/store'

(function () {
  const originalFetch = window.fetch

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args)
    const { currentUser } = window.PsyGlobalState
    const nextTimeout = response.headers.get('x-next-timeout')

    CreateSyncTimeoutChannel.setChannel()
    CreateSyncTimeoutChannel.channel?.postMessage({ userId: currentUser?.id, nextTimeout })

    if (CLIENT_ERRORS.includes(String(response.status))) {
      adminStore.dispatch(setRequestErrors('axios', String(response.status) as ClientErrorStatus))
      clientStore.dispatch(setRequestErrors('axios', String(response.status) as ClientErrorStatus))
      surveyStore.dispatch(setRequestErrors('axios', String(response.status) as ClientErrorStatus))
    }

    return response
  }
}())
