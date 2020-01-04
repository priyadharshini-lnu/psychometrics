import { connect } from 'react-redux'
import { moduleConfig } from 'core/builder/assessment/question/selectors'
import { questionErrors, questionResults } from 'core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview }, { model }) => ({
    moduleConfig: moduleConfig(preview, model.id),
    errors: questionErrors(preview, model.id),
    result: questionResults(preview, model.id),
  }),
  {
  },
)
