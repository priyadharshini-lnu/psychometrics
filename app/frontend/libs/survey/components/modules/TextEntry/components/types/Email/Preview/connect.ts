import { connect } from 'react-redux'
import { addQuestionError, removeQuestionError } from 'libs/survey/core/preview/FlowProcessor/actions'
import { getQuestionErrors } from 'core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview }, { model }) => ({
    errors: getQuestionErrors(preview, model.id),
  }),
  {
    addQuestionError,
    removeQuestionError,
  },
)
