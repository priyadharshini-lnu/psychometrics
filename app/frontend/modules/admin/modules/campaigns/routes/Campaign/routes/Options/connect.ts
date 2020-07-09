import { connect } from 'react-redux'
import { fetch, update } from 'modules/admin/modules/campaigns/core/current'

export default connect(
  ({ campaigns: { current: { options } } }) => ({
    options,
  }),
  {
    fetch,
    update,
  },
)
