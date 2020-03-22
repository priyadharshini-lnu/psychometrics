import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  state => ({

  }),
  {
    openConditionalImage: data => openModal('conditionalImage', data),
  },
)
