import { connect } from 'react-redux'
import { subscribeSocket } from '~/modules/survey/core/temp/socket'
import { fetch, init } from '~/modules/survey/core/builder/assessment/actions'
import { actions } from '~/modules/survey/core/builder/flow'

export default connect(
  ({ survey }) => ({
    disabled: survey.builder.assessment.disabled,
    socketInitialized: survey.ui.socket.initialized,
    defaultLocale: survey.builder.assessment.defaultLanguage,
    currentLocale: survey.builder.assessment.locale,
  }),
  {
    subscribeSocket,
    fetch,
    init,
    resetFlow: actions.reset,
  },
)
