import { connect } from 'react-redux'
import { subscribeSocket } from '~/modules/survey/core/temp/socket'
import { fetch, init } from '~/modules/survey/core/builder/assessment/actions'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.assessment.loaded,
    disabled: survey.builder.assessment.disabled,
    socketInitialized: survey.ui.socket.initialized,
  }),
  {
    subscribeSocket,
    fetch,
    init,
  },
)
