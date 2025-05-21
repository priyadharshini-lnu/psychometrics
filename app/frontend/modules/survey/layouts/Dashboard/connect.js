import { connect } from 'react-redux'
import { subscribeSocket } from '~/modules/survey/core/temp/socket'
import {
  fetch, init, SAVE, FETCH,
} from '~/modules/survey/core/builder/assessment/actions'
import { actions } from '~/modules/survey/core/builder/flow'
import { isRequestInProgress } from '~/core/request'

export default connect(
  (state) => {
    const { survey } = state
    return ({
      disabled: survey.builder.assessment.disabled,
      socketInitialized: survey.ui.socket.initialized,
      defaultLocale: survey.builder.assessment.defaultLanguage,
      currentLocale: survey.builder.assessment.locale,
      isLoading: isRequestInProgress(state, FETCH) || isRequestInProgress(state, SAVE),
    })
  },
  {
    subscribeSocket,
    fetch,
    init,
    resetFlow: actions.reset,
  },
)
