import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'

const connecter = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
