import { connect } from 'react-redux'
import {
  getCurrentPage,
  getCurrentBlock,
  pageQuestionsWithoutHidden,
  pageErrors,
  getPrevPage,
  getProgress,
  getI18n,
} from '~/modules/survey/core/preview/FlowProcessor/selectors'
import {
  nextPage,
  prevPage,
} from '~/modules/survey/core/preview/FlowProcessor/actions'
import { RootState } from '~/modules/survey/core/rootReducers'
import { fetchCampaignOptions } from '~/modules/endUser/modules/campaigns/core/campaign'
import { isConnected } from '~/core/connection'

export default connect(
  (state: RootState) => {
    const {
      preview,
      preview: { initialized },
    } = state

    return {
      preview,
      hasPrevPage: initialized && getPrevPage(preview),
      page: initialized && (getCurrentPage(preview) || {}),
      questions: initialized && pageQuestionsWithoutHidden(preview),
      block: initialized && (getCurrentBlock(preview) || {}),
      errors: initialized && pageErrors(preview),
      progress: initialized && getProgress(preview),
      I18n: getI18n(preview),
      isDisconnected: !isConnected(state),
    }
  },
  {
    nextPage,
    prevPage,
    fetchCampaignOptions,
  },
)
