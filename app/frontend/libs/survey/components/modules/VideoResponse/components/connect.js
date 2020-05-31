import { connect } from 'react-redux'
import { getI18n } from 'libs/survey/core/preview/FlowProcessor/selectors'
import { markQuestionInProgress, removeQuestionInProgress } from 'libs/survey/core/preview/FlowProcessor/actions'
import { saveCurrentPage } from 'core/preview/FlowProcessor/actions'

export default connect(
  ({ preview }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
  }),
  {
    markQuestionInProgress,
    removeQuestionInProgress,
    saveCurrentPage
  },
)
