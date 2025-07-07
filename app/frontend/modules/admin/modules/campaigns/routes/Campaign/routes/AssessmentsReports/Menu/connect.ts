import { connect, ConnectedProps } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    campaignPermissions: getCurrentCampaign(state).permissions,
  }),
  {
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
