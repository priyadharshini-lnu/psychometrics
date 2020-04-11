import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  state => ({
    report: state.report,
  }),
  {
    openDisplayLogic: data => openModal('displayLogic', data),
  },
)
