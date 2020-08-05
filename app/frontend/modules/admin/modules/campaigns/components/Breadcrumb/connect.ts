import { connect } from 'react-redux'
import { fetch } from 'modules/admin/core/ui/breadcrumbs'

export default connect(
  ({ ui: { breadcrumbs } }) => ({
    state: breadcrumbs,
  }),
  {
    fetch,
  },
)
