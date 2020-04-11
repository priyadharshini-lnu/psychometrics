import { connect } from 'react-redux'
import {
  removeQuestion, insertBeforeQuestion, insertAfterQuestion,
} from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  () => ({}),
  {
    removeQuestion,
    insertBeforeQuestion,
    insertAfterQuestion,
  },
)
