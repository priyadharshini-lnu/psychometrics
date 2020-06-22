import { connect } from 'react-redux'
import { getCurrent, getData, closeModal } from 'admin/core/temp/modals'

export default connect(
  state => ({
    current: getCurrent(state),
    data: getData(state),
  }),
  {
    closeModal,
  },
)
