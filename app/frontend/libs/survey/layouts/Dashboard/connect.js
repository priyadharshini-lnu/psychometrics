import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/survey/core/temp/socket'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.assessment.loaded,
    disabled: survey.builder.assessment.disabled,
    socketInitialized: survey.temp.socket.initialized,
  }),
  {
    subscribeSocket,
  },
)
