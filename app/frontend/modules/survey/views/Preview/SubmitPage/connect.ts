import { connect } from 'react-redux'
import {
  getCurrentPage, getPrevPage, getI18n,
} from 'modules/survey/core/preview/FlowProcessor/selectors'
import {
  nextPage, prevPage,
} from 'modules/survey/core/preview/FlowProcessor/actions'
import { RootState } from 'modules/survey/core/rootReducers'
import { fetchCampaignOptions } from 'modules/user/modules/campaigns/core/campaign'
import { isConnected } from 'core/connection'

export default connect(
  (state: RootState) => {
    const { preview, preview: { initialized } } = state

    return {
      preview,
      hasPrevPage: initialized && getPrevPage(preview),
      page: initialized && getCurrentPage(preview),
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
