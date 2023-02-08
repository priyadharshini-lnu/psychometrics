import { connect } from 'react-redux'
import { openModal, getCurrent } from '~/modules/admin/core/ui/modals'

export default connect(
  state => ({ current: getCurrent(state) }),
  { openModal },
)
