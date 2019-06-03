import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'

export default connect(
  ({ temp: { modals: { current } }, }) => ({
    current
  }),
  {
    closeModal,
  },
)
