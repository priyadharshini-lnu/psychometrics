import { connect } from 'react-redux'
import { } from 'libs/reports/core/builder/actions'
import { getModule, getSelected } from 'libs/reports/core/builder/selectors'

export default connect(
  ({ report, report: { builder } }) => ({
    report,
    selected: getSelected(report.builder),
    module: builder.selected.type === 'Module' && getModule(report, builder.selected.moduleId),
  }),
  {
  },
)
