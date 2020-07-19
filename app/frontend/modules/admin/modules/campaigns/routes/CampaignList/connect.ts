import { connect } from 'react-redux'
import {
  fetch,
  get as getCampaign,
} from 'modules/admin/modules/campaigns/core/list'
import { openModal } from 'modules/admin/core/ui/modals'
import { get as getTotal } from 'modules/admin/modules/campaigns/core/total'

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
