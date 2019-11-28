import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/survey/core/temp/socket'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.assessment.loaded,
    socketInitialized: survey.temp.socket.initialized,
  }),
  { subscribeSocket },
)
