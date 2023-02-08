import { connect } from 'react-redux'
import {
  removeQuestion, insertBeforeQuestion, insertAfterQuestion, moveQuestionUp, moveQuestionDown,
} from '~/modules/survey/core/builder/assessment/block/actions'

export default connect(
  () => ({}),
  {
    removeQuestion,
    insertBeforeQuestion,
    insertAfterQuestion,
    moveQuestionUp,
    moveQuestionDown,
  },
)
