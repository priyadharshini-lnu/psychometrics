import { connect } from 'react-redux'
import { removeQuestion } from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  () => ({}),
  {
    removeQuestion,
  },
)
