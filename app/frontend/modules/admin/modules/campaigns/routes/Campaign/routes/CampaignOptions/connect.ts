import { connect } from 'react-redux'
import {
  fetch,
  update,
  get as getCampaignOptions,
} from 'modules/admin/modules/campaigns/core/campaignOptions'

export default connect(
  state => ({
    options: getCampaignOptions(state),
  }),
  {
    fetch,
    update,
  },
)
