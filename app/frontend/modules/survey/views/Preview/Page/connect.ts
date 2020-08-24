import { connect } from 'react-redux'
import {
  getCurrentPage, getCurrentBlock, pageQuestionsWithoutHidden, pageErrors, getPrevPage, getProgress, getI18n,
} from 'modules/survey/core/preview/FlowProcessor/selectors'
import {
  nextPage, prevPage,
} from 'modules/survey/core/preview/FlowProcessor/actions'
import { RootState } from 'modules/survey/core/rootReducers'

export default connect(
  ({ preview, preview: { initialized } }: RootState) => ({
    preview,
    hasPrevPage: initialized && getPrevPage(preview),
    page: initialized && getCurrentPage(preview),
    questions: initialized && pageQuestionsWithoutHidden(preview),
    block: initialized && getCurrentBlock(preview),
    errors: initialized && pageErrors(preview),
    progress: initialized && getProgress(preview),
    I18n: getI18n(preview),
  }),
  {
    nextPage,
    prevPage,
  },
)
