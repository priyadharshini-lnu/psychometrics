import { connect } from 'react-redux'
import {
  fetch,
  remove,
  toggleActive,
  get as getUsers,
  exportCompletionStatuses,
  exportCompactCompletionStatuses,
  exportUsers,
} from '~/modules/admin/modules/campaigns/core/users'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    users: getUsers(state),
  }),
  {
    fetch,
    remove,
    openModal,
    toggleActive,
    exportCompletionStatuses,
    exportCompactCompletionStatuses,
    exportUsers,
  },
)
export default connecter
