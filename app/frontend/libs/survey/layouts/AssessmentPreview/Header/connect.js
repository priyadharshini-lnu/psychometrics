import { connect } from 'react-redux'
import { toggleHiddenQuestions, toggleIgnoreValidation, reset } from 'libs/survey/core/preview/FlowProcessor/actions'

export default connect(
  ({ preview }) => ({
    ignoreValidation: preview.ignoreValidation,
    hideHiddenQuestions: preview.hideHiddenQuestions,
  }),
  {
    toggleHiddenQuestions,
    toggleIgnoreValidation,
    reset,
  },
)
