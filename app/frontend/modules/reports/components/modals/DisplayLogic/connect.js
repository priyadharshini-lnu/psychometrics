import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'
import { saveDisplayLogic } from 'modules/reports/core/builder/page/actions'
import { getFlatFactors } from 'modules/reports/core/builder/selectors'

export default connect(
  state => ({
    ...getData(state.report).displayLogic,
    factors: getFlatFactors(state),
  }),
  {
    close: () => closeModal('displayLogic'),
    saveDisplayLogic,
  },
)
