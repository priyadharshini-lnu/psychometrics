import { connect } from 'react-redux'
import { } from '~/modules/reports/core/builder/actions'
import { getModule, getSelected } from '~/modules/reports/core/builder/selectors'
import { updateModule } from '~/modules/reports/core/builder/module/actions'

export default connect(
  ({ report, report: { builder } }) => ({
    report,
    selected: getSelected(report.builder),
    module: builder.selected.type === 'Module' && getModule(report, builder.selected.moduleId),
    page: builder.selected.type === 'Page' && report.pages[builder.selected.moduleId.id],
  }),
  {
    updateModule,
  },
)
