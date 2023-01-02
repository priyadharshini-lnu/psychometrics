import { connect } from 'react-redux'
import { subscribeSocket } from 'modules/survey/core/temp/socket'
import { importTranslations } from 'modules/survey/core/builder/questionCenter/index.ts'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.questionCenter.loaded,
    disabled: survey.builder.questionCenter.disabled,
    socketInitialized: survey.ui.socket.initialized,
    question: survey.builder.questionCenter.question,
  }),
  {
    subscribeSocket,
    importTranslations,
  },
)
