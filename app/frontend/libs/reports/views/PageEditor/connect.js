import { connect } from 'react-redux'
import { getPages } from 'libs/reports/core/builder/selectors'

export default connect(
  state => ({
    report: state.report.builder,
    pages: getPages(state.report, state.report.builder.pages),
  }),
  {
  },
)
