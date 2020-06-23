import { connect } from 'react-redux'
import { getI18n } from 'modules/survey/core/preview/FlowProcessor/selectors'
import { markQuestionInProgress, removeQuestionInProgress } from 'modules/survey/core/preview/FlowProcessor/actions'

export default connect(
  ({ preview }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
  }),
  {
    markQuestionInProgress,
    removeQuestionInProgress,
  },
)
