import { connect } from 'react-redux'
import { getCurrent } from 'modules/admin/core/temp/modals'

export default connect(
  ({ survey }) => ({
    current: getCurrent(survey),
  }),
  {},
)
