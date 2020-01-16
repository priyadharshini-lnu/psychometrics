import { connect } from 'react-redux'
import { currentPageSelector, pageQuestions, pageErrors } from 'core/preview/FlowProcessor/selectors'
import {
  nextPage,
} from 'core/preview/FlowProcessor/actions'

export default connect(
  ({ preview, preview: { initialized } }) => ({
    page: initialized && currentPageSelector(preview),
    questions: initialized && pageQuestions(preview),
    errors: initialized && pageErrors(preview),
  }),
  {
    nextPage,
  },
)
