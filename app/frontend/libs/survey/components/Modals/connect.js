import { connect } from 'react-redux'
import { getCurrent } from 'admin/core/temp/modals'

export default connect(
  ({ survey }) => ({
    current: getCurrent(survey),
  }),
  {},
)
