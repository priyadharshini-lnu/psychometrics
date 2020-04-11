import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/survey/core/temp/socket'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.questionCenter.loaded,
    disabled: survey.builder.questionCenter.disabled,
    socketInitialized: survey.temp.socket.initialized,
    question: survey.builder.questionCenter.question,
  }),
  {
    subscribeSocket,
  },
)
