import { connect } from 'react-redux'
import { removeQuestion } from 'libs/survey/core/builder/assessment/question/actions'

export default connect(
  {},
  {
    removeQuestion,
  },
)
