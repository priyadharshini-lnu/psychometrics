import { connect } from 'react-redux'
import { getCurrent, getData, closeModal } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    current: getCurrent(state),
    data: getData(state),
  }),
  {
    closeModal,
  },
)
