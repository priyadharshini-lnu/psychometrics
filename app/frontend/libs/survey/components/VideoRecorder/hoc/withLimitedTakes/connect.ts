import { connect } from 'react-redux'
import { saveCurrentPage } from 'core/preview/FlowProcessor/actions'

export default connect(
  ({ preview: { inProgressQuestions } }) => ({
    inProgressQuestions
  }),
  {
    saveCurrentPage
  }
)
