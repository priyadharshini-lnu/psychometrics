import { connect } from 'react-redux'
import { openModal } from 'admin/core/modals'

export default connect(
  ({ temp: { modals: { current } } }) => ({ current }),
  { openModal },
)
