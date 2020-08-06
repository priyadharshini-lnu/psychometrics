import { connect } from 'react-redux'
import { get as getReports } from 'modules/admin/modules/campaigns/core/userReports'

export default connect(
  state => ({
    reports: getReports(state),
  }),
  {
  },
)
