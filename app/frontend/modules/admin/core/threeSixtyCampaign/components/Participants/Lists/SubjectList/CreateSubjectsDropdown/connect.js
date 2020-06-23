import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'

export default connect(
  ({ temp: { modals: { current } } }) => ({ current }),
  { openModal },
)
