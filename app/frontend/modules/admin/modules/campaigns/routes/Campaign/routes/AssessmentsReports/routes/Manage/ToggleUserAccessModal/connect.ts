import { connect, ConnectedProps } from 'react-redux'
import { toggleUserAccess } from '~/modules/admin/modules/campaigns/core/reports'

const connecter = connect(
  () => ({}), {
    toggleUserAccess,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
