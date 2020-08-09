import { connect } from 'react-redux'
import { saveCurrentPage } from 'core/preview/FlowProcessor/actions'
import { RootState } from 'modules/survey/core/rootReducers'

export default connect(
  ({ preview: { inProgressQuestions } }: RootState) => ({
    inProgressQuestions,
  }),
  {
    saveCurrentPage,
  },
)
