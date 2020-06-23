import { connect } from 'react-redux'
import { closeModal, getCurrent } from 'modules/admin/core/temp/modals'

export default connect(
  state => ({
    current: getCurrent(state),
  }),
  {
    closeModal,
  },
)
