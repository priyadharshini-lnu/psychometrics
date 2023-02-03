import { connect } from 'react-redux'
import { allQuestions } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey: { builder } }) => ({
    questions: allQuestions(builder, builder.assessment.blocks),
  }),
  {
  },
)
