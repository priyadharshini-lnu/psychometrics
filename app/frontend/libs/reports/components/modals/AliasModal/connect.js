import { connect } from 'react-redux'
import { openModal, closeModal, getData } from 'admin/core/temp/modals'

export default connect(
  state => ({
    ...getData(state.report).alias,
  }),
  {
    close: () => closeModal('alias'),
    showSavePopup: data => openModal('savePopUp', data),
  },
)
