import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'

import { importUsers, IMPORT } from '~/modules/admin/modules/campaigns/core/users'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importUsers,
  },
)
export default connecter

export type PropsFromRedux = ConnectedProps<typeof connecter>
