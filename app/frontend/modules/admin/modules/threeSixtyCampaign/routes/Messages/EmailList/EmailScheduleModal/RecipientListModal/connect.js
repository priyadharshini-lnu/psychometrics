import { connect } from 'react-redux'
import { closeModal, getCurrent } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    current: getCurrent(state),
  }),
  {
    closeModal,
  },
)
