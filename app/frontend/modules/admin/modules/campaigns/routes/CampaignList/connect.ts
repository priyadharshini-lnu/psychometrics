import { connect, ConnectedProps } from 'react-redux'
import {
  fetch,
  get as getCampaign,
  remove,
} from 'modules/admin/modules/campaigns/core/list'
import { openModal } from 'modules/admin/core/ui/modals'
import { get as getTotal } from 'modules/admin/modules/campaigns/core/total'

const connecter = connect(
  state => ({
    list: getCampaign(state),
    total: getTotal(state),
  }),
  {
    fetch,
    openModal,
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
