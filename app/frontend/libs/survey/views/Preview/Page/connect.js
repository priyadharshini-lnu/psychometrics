import { connect } from 'react-redux'
import { currentPageSelector, pageQuestions, pageErrors } from 'core/preview/FlowProcessor/selectors'
import {
  nextPage,
} from 'core/preview/FlowProcessor/actions'

export default connect(
  ({ preview, preview: { currentBlock } }) => ({
    page: currentBlock && currentPageSelector(preview),
    questions: currentBlock && pageQuestions(preview),
    errors: currentBlock && pageErrors(preview),
  }),
  {
    nextPage,
  },
)
