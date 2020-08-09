import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/user/core/rootReducers'
import { fetch } from '../../core/checkingWizard'

const connecter = connect(({ checkingWizard }: RootState) => ({
  checks: checkingWizard.checks,
  config: checkingWizard.config,
  campaignId: checkingWizard.campaignId,
  id: checkingWizard.id,
  url: checkingWizard.url,
}), {
  fetch,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
