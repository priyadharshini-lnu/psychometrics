import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    ...getData(state.report).innovationStyleCondition,
  }),
  {
    close: () => closeModal('innovationStyleCondition'),
  },
)
