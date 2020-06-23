import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from 'modules/admin/core/temp/modals'

export default connect(
  state => ({
    current: getCurrent(state),
    data: getData(state).ResetSubjectModal,
    currentUser: state.temp.currentUser,
  }),
  { closeModal },
)
