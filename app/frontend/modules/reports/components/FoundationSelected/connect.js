import { connect } from 'react-redux'
import { getCurrentPage, getModules } from '~/modules/reports/core/builder/selectors'
import ModuleModel from '~/modules/reports/models/Module'

export default connect(
  (state, { pageId }) => ({
    currentPage: getCurrentPage(state.report),
    selectedPageId: state.report.ui.selection.pageId,
    selected: state.report.ui.selection.selected,
    modules: getModules(state.report, state.report.ui.selection.selected).map(m => new ModuleModel(m, pageId)),
    pageSize: state.report.builder.props.sizes,
    flipContent: state.report.builder.flip_content,
  }),
  {},
)
