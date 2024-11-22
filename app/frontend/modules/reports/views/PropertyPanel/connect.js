import { connect } from 'react-redux'
import { } from '~/modules/reports/core/builder/actions'
import { getSelected, getModules } from '~/modules/reports/core/builder/selectors'
import { updateModule } from '~/modules/reports/core/builder/module/actions'
import ModuleModel from '~/modules/reports/models/Module'

export default connect(
  ({ report, report: { builder } }) => ({
    report,
    selected: getSelected(report.builder),
    modules: getModules(report, report.ui.selection.selected).map(m => new ModuleModel(m, report.ui.selection.pageId)),
    reportStyles: builder.styles,
  }),
  {
    updateModule,
  },
)
