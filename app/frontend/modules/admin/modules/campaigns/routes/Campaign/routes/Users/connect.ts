import { connect } from 'react-redux'
import {
  fetch,
  remove,
  toggleStatus,
  resetPassword,
  get as getUsers,
} from 'modules/admin/modules/campaigns/core/users'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
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
