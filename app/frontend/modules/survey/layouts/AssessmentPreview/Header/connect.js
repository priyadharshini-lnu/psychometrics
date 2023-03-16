import { connect } from 'react-redux'
import {
  toggleHiddenQuestions, toggleIgnoreValidation, reset,
} from '~/modules/survey/core/preview/FlowProcessor/actions'

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
