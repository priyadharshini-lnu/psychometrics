import { connect } from 'react-redux'
import { fetch } from '~/modules/admin/core/ui/breadcrumbs'
import { RootState } from '~/modules/admin/core/rootReducers'

export default connect(
  ({ ui: { breadcrumbs } }: RootState) => ({
    state: breadcrumbs,
  }),
  {
    fetch,
  },
)
