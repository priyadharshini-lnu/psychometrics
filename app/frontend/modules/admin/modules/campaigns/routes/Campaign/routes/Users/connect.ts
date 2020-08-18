import { connect, ConnectedProps } from 'react-redux'
import {
  fetch,
  remove,
  toggleStatus,
  resetPassword,
  get as getUsers,
} from 'modules/admin/modules/campaigns/core/users'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    users: getUsers(state),
  }),
  {
    fetch,
    remove,
    resetPassword,
    openModal,
    toggleStatus,
  },
)
export default connecter

type PropsFromRedux = ConnectedProps<typeof connecter>
