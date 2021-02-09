import { connect, ConnectedProps } from 'react-redux'
import { get as getConfig } from 'modules/user/core/config'
import { RootState } from 'modules/user/core/rootReducers'
import { get as getCurrentUser } from 'core/currentUser'
import { get as getCampaign } from 'modules/user/modules/campaigns/core/campaign/selectors'

const connecter = connect(
  (state: RootState) => ({
    ...getConfig(state),
    isAnonym: getCurrentUser(state).isAnonym,
    campaignId: getCampaign(state).id,
  }),
  {},
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
