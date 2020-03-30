import { connect } from 'react-redux'
import { getCurrent } from 'admin/core/temp/modals'

export default connect(
  ({ report }) => ({
    current: getCurrent(report),
  }),
  {},
)
