import { connect } from 'react-redux'
import { allQuestions } from 'libs/survey/core/builder/assessment/selectors'

export default connect(
  state => ({
    questions: allQuestions(state.survey.builder),
  }),
  {
  },
)
