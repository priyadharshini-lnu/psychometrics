import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from 'modules/admin/core/ui/modals'
import { get as getCurrentUser } from 'core/currentUser'

export default connect(
  state => ({
    current: getCurrent(state),
    data: getData(state).ResetSubjectModal,
    currentUser: getCurrentUser(state),
  }),
  { closeModal },
)
