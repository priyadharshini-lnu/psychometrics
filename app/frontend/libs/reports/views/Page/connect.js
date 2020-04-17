import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { getModules, getModulesShowOnAll } from 'libs/reports/core/builder/selectors'
import { addPage, unselectModules, selectModule } from 'libs/reports/core/builder/actions'
import { renamePage } from 'libs/reports/core/builder/page/actions'

export default connect(
  (state, props) => ({
    report: state.report,
    modules: getModules(state.report, props.moduleIds),
    showOnAllPages: getModulesShowOnAll(state.report),
  }),
  {
    addPage,
    renamePage,
    unselectModules,
    selectModule,
    openDisplayLogic: data => openModal('displayLogic', data),
  },
)
