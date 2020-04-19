import { connect } from 'react-redux'
import { removePage } from 'libs/reports/core/builder/page/actions'
import { changeSize } from 'libs/reports/core/builder/actions'
import { getModule, getSelected } from 'libs/reports/core/builder/selectors'

export default connect(
  ({ report, report: { builder } }) => ({
    report: builder,
    selected: getSelected(report.builder),
    module: builder.selected.type === 'Module' && getModule(report, builder.selected.moduleId),
  }),
  {
    removePage,
    changeSize,
  },
)
