import { connect } from 'react-redux'
import {
  getCurrentPage, getCurrentBlock, pageQuestionsWithoutHidden, pageErrors, getPrevPage, getProgress,
} from 'core/preview/FlowProcessor/selectors'
import {
  nextPage, prevPage,
} from 'core/preview/FlowProcessor/actions'

export default connect(
  ({ preview, preview: { initialized } }) => ({
    preview,
    hasPrevPage: initialized && getPrevPage(preview),
    page: initialized && getCurrentPage(preview),
    questions: initialized && pageQuestionsWithoutHidden(preview),
    block: initialized && getCurrentBlock(preview),
    errors: initialized && pageErrors(preview),
    progress: initialized && getProgress(preview),
  }),
  {
    nextPage,
    prevPage,
  },
)
