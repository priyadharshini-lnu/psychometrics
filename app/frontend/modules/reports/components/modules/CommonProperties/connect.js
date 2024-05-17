import { connect } from 'react-redux'
import { removePage } from '~/modules/reports/core/builder/page/actions'
import { copyPage, pastePage } from '~/modules/reports/core/builder/actions'
import { getModule, getPage, getSelected } from '~/modules/reports/core/builder/selectors'

export default connect(
  ({ report, report: { builder } }) => ({
    report: builder,
    selected: getSelected(report.builder),
    module: builder.selected.type === 'Module' && getModule(report, builder.selected.moduleId),
    page: builder.selected.type === 'Page' && getPage(report, builder.selected.moduleId.id),
    bufferPage: builder.buffer.sourceId && getPage(report, builder.buffer.sourceId),
  }),
  {
    removePage,
    copyPage,
    pastePage,
  },
)
