import { connect } from 'react-redux'
import { questionsWithoutDeleted } from 'core/builder/assessment/selectors'
import Question from 'models/Question'

export default connect(
  (store, props) => ({
    questions: questionsWithoutDeleted(store.survey.builder, props.block.questions).map(q => new Question(q)),
  }),
  {

  },
)
