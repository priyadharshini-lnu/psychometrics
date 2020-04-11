import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  null,
  {
    openInnovationStyleCondition: data => openModal('innovationStyleCondition', data),
  },
)
