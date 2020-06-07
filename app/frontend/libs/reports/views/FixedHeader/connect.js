import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { save, updateCurrentPage, unselectModules } from 'libs/reports/core/builder/actions'
import { addModule } from 'libs/reports/core/builder/page/actions'
import { removeModule } from 'libs/reports/core/builder/module/actions'
import { getCurrentPage } from 'libs/reports/core/builder/selectors'

export default connect(
  state => ({
    report: state.report,
    currentPage: state.report.builder.loaded && getCurrentPage(state.report),
    richEditorOpened: state.report.builder.richEditorOpened,
    selected: state.report.builder.selected,
  }),
  {
    save,
    updateCurrentPage,
    addModule,
    removeModule,
    unselectModules,
    openFilter: data => openModal('filter', data),
    openDataSheet: data => openModal('dataSheet', data),
    openAlias: data => openModal('alias', data),
    openDataConfiguration: data => openModal('dataConfiguration', data),
  },
)
