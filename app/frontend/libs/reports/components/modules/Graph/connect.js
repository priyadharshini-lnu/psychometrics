import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  state => ({

  }),
  {
    openConditionalText: data => openModal('conditionalText', data),
  },
)
