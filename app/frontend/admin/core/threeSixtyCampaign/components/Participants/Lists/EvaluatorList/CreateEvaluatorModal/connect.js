import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { searchUsers } from 'admin/core/temp/users'
import { createAll } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({ temp: { errors, modals: { current }, users } }) => ({ errors, current, tempUsers: users }),
  { closeModal, searchUsers, createAll },
)
