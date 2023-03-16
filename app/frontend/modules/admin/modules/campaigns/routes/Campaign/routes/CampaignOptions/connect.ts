import { connect, ConnectedProps } from 'react-redux'
import {
  fetch,
  update,
  get as getCampaignOptions,
} from '~/modules/admin/modules/campaigns/core/campaignOptions'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    options: getCampaignOptions(state),
  }),
  {
    fetch,
    update,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
export default connecter
