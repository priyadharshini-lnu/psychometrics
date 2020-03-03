import { connect } from 'react-redux'
import { questionsWithoutDeleted } from 'core/builder/assessment/selectors'

export default connect(
  (store, props) => ({
    questions: questionsWithoutDeleted(store.survey.builder, props.block.questions),
  }),
  {

  },
)
