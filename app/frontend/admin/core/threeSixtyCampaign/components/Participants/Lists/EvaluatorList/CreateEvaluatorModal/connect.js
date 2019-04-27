import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { searchUsersInProject } from 'admin/core/temp/autocomplete'
import { createAll } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({ temp: { errors, modals: { current }, autocomplete: { users } } }) => ({ errors, current, tempUsers: users }),
  { closeModal, searchUsersInProject, createAll },
)
