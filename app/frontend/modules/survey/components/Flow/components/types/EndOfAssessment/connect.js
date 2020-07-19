import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  null,
  {
    openModal: data => openModal('endOfAssessment', data),
  },
)
