import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/temp/modals'

export default connect(
  state => ({
    ...getData(state.report).CPIFactorCondition,
  }),
  {
    close: () => closeModal('CPIFactorCondition'),
  },
)
