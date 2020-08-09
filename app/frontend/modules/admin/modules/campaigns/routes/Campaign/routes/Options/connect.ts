import { connect } from 'react-redux'
import { fetch, update } from 'modules/admin/modules/campaigns/core/current'
import { RootState } from 'modules/admin/core/rootReducers'

export default connect(
  ({ campaigns: { current: { options } } }: RootState) => ({
    options,
  }),
  {
    fetch,
    update,
  },
)
