import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { renameReport, selectModule } from 'libs/reports/core/builder/actions'
import { getPages } from 'libs/reports/core/builder/selectors'

export default connect(
  state => ({
    report: state.report.builder,
    pages: getPages(state.report, state.report.builder.pages),
  }),
  {
    openDisplayLogic: data => openModal('displayLogic', data),
    renameReport,
    selectModule,
  },
)
