import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { getModules } from 'libs/reports/core/builder/selectors'
import { addPage, unselectModules } from 'libs/reports/core/builder/actions'
import { renamePage } from 'libs/reports/core/builder/page/actions'

export default connect(
  (state, props) => ({
    report: state.report,
    modules: getModules(state.report, props.moduleIds),
    showOnAllPages: getModules(state.report, state.report.builder.showOnAllPages),
  }),
  {
    addPage,
    renamePage,
    unselectModules,
    openDisplayLogic: data => openModal('displayLogic', data),
  },
)
