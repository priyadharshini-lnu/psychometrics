import { connect, ConnectedProps } from 'react-redux'
import { fetch } from 'modules/admin/modules/campaigns/core/assessmentGroups'

const connecter = connect(
  () => ({}),
  {
    fetch,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
