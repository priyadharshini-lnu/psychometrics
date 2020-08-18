import { connect, ConnectedProps } from 'react-redux'
import { remove } from 'modules/admin/modules/campaigns/core/reports'

const connecter = connect(
  () => ({}), {
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
