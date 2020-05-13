import { connect } from 'react-redux'
import {
  fetch,
  get as getCampaign,
} from 'admin/core/campaigns/list'

import { get as getTotal } from 'admin/core/campaigns/total'

export default connect(
  state => ({
    list: getCampaign(state),
    total: getTotal(state),
  }),
  {
    fetch,
  },
)
