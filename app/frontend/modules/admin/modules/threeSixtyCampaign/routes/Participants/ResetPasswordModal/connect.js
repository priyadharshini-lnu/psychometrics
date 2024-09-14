import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from '~/modules/admin/core/ui/modals'

export default connect(
  state => ({
    ...getData(state).ResetPasswordModal,
    current: getCurrent(state),
  }),
  { close: closeModal },
)
