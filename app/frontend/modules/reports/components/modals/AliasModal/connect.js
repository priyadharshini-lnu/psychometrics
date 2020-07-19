import { connect } from 'react-redux'
import { openModal, closeModal, getData } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    ...getData(state.report).alias,
  }),
  {
    close: () => closeModal('alias'),
    showSavePopup: data => openModal('savePopUp', data),
  },
)
