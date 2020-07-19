import { connect } from 'react-redux'
import {
  fetch,
  get as getUsers,
} from 'modules/admin/modules/campaigns/core/users'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    users: getUsers(state),
  }),
  {
    fetch,
    openModal,
  },
)
