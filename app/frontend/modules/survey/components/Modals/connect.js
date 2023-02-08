import { connect } from 'react-redux'
import { getCurrent } from '~/modules/admin/core/ui/modals'

export default connect(
  ({ survey }) => ({
    current: getCurrent(survey),
  }),
  {},
)
