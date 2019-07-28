import { connect } from 'react-redux'
import { update } from 'admin/core/temp/pagination'

export default connect(
  ({ temp: { pagination: { page } } }) => ({ page }),
  {
    update,
  },
)
