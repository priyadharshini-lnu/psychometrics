import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  () => ({}),
  {
    openRichEditor: data => openModal('richEditor', data),
  },
)
