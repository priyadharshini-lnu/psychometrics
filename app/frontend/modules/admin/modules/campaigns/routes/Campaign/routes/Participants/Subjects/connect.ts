import { connect } from 'react-redux'
import {
  fetch,
  remove,
  toggleActive,
  resetPassword,
  get as getUsers,
  exportCompletionStatuses,
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
    toggleActive,
    exportCompletionStatuses,
  },
)
export default connecter
