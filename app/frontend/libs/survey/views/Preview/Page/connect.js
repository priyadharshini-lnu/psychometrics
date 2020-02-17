import { connect } from 'react-redux'
import {
  currentPageSelector, pageQuestionsWithoutHidden, pageErrors, getPrevPage,
} from 'core/preview/FlowProcessor/selectors'
import {
  nextPage, prevPage,
} from 'core/preview/FlowProcessor/actions'

export default connect(
  ({ preview, preview: { initialized } }) => ({
    enableBack: preview.enableBack,
    enableProgress: preview.enableProgress,
    type: preview.type,
    hasPrevPage: initialized && getPrevPage(preview),
    page: initialized && currentPageSelector(preview),
    questions: initialized && pageQuestionsWithoutHidden(preview),
    errors: initialized && pageErrors(preview),
  }),
  {
    nextPage,
    prevPage,
  },
)
