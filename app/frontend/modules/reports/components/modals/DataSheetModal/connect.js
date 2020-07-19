import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'
import { saveDataSheet } from 'modules/reports/core/builder/actions'

export default connect(
  state => ({
    ...getData(state.report).dataSheet,
  }),
  {
    close: () => closeModal('dataSheet'),
    saveDataSheet,
  },
)
