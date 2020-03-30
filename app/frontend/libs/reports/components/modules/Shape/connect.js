import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  null,
  {
    openConditionalText: data => openModal('conditionalText', data),
  },
)
