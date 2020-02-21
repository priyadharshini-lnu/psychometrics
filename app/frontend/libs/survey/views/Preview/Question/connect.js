import { connect } from 'react-redux'
import { moduleConfig } from 'core/builder/assessment/question/selectors'
import { getQuestionErrors, getQuestionResults } from 'core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview }, { model }) => ({
    moduleConfig: moduleConfig(preview, model.id),
    errors: getQuestionErrors(preview, model.id),
    result: getQuestionResults(preview, model.id),
  }),
  {
  },
)
