import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/survey/core/temp/socket'
import { selectBlock } from 'libs/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.assessment.loaded,
    disabled: survey.builder.assessment.disabled,
    socketInitialized: survey.temp.socket.initialized,
    block: selectBlock(survey.builder, survey.builder.assessment.id),
  }),
  {
    subscribeSocket,
  },
)
