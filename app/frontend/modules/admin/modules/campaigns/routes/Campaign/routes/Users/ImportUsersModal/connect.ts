import { connect, ConnectedProps } from 'react-redux'
import { importUsers, IMPORT } from 'modules/admin/modules/campaigns/core/users'
import { isRequestInProgress } from 'modules/admin/core/request'

const connecter = connect(
  state => ({
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importUsers,
  },
)
export default connecter

export type PropsFromRedux = ConnectedProps<typeof connecter>
