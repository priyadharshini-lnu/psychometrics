import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  getModules, getModulesShowOnAll, getQuestions, getRenderModules,
} from '~/modules/reports/core/builder/selectors'
import { addPage, unselectModules, selectModule } from '~/modules/reports/core/builder/actions'
import { renamePage, removeDisplayLogic } from '~/modules/reports/core/builder/page/actions'

export default connect(
  (state, props) => ({
    report: state.report,
    modules: getModules(state.report, props.moduleIds),
    showOnAllPages: getModulesShowOnAll(state.report),
    questions: assessmentId => getQuestions(state.report, assessmentId),
    renderMoudles: getRenderModules(state.report, props.model.id),
    reportStyles: state.report.builder.styles,
  }),
  {
    addPage,
    renamePage,
    unselectModules,
    selectModule,
    openDisplayLogic: data => openModal('displayLogic', data),
    removeDisplayLogic,
  },
)
