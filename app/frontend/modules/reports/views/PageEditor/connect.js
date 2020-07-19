import { connect } from 'react-redux'
import { getPages } from 'modules/reports/core/builder/selectors'
import { updatePagePositions } from 'modules/reports/core/builder/actions'

export default connect(
  state => ({
    report: state.report.builder,
    pages: getPages(state.report, state.report.builder.pages),
  }),
  {
    updatePagePositions,
  },
)
