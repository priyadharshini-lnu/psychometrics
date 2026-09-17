import { connect } from 'react-redux'
import { enableApp, disableApp } from '~/modules/survey/core/temp/socket'
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
      disableReason: survey.builder.assessment.disableReason,
      disableMessage: survey.builder.assessment.disableMessage,
      defaultLocale: survey.builder.assessment.defaultLanguage,
      currentLocale: survey.builder.assessment.locale,
      isLoading: isRequestInProgress(state, FETCH) || isRequestInProgress(state, SAVE),
    })
  },
  {
    fetch,
    init,
    enableApp,
    disableApp,
    resetFlow: actions.reset,
  },
)
