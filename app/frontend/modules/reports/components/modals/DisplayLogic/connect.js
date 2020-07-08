import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'
import { saveDisplayLogic } from 'modules/reports/core/builder/page/actions'

export default connect(
  state => ({
    ...getData(state.report).displayLogic,
  }),
  {
    close: () => closeModal('displayLogic'),
    saveDisplayLogic,
  },
)
