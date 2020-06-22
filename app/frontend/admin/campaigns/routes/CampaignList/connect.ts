import { connect } from 'react-redux'
import {
  fetch,
  get as getCampaign,
} from 'admin/campaigns/core/list'
import { openModal } from 'admin/core/temp/modals'
import { get as getTotal } from 'admin/campaigns/core/total'

export default connect(
  state => ({
    list: getCampaign(state),
    total: getTotal(state),
  }),
  {
    fetch,
    openModal,
  },
)
