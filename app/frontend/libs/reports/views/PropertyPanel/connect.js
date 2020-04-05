import { connect } from 'react-redux'
import { showOnAllPages } from 'libs/reports/core/builder/actions'

export default connect(
  state => ({
    report: state.report,
  }),
  {
    showOnAllPages,
  },
)
