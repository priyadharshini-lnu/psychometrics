import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'

export default connect(
  state => ({
    ...getData(state.report).dataSheet,
  }),
  {
    close: () => closeModal('dataSheet'),
  },
)
