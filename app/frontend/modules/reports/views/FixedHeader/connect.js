import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  save, updateCurrentPage, copyModule, pasteModule,
} from '~/modules/reports/core/builder/actions'
import { addModule } from '~/modules/reports/core/builder/page/actions'
import { removeModule, updateModule } from '~/modules/reports/core/builder/module/actions'
import {
  getCurrentPage, getBufferedModule, getModules,
} from '~/modules/reports/core/builder/selectors'
import ModuleModel from '~/modules/reports/models/Module'
import { actions } from '~/modules/reports/core/temp/selection'

export default connect(
  state => ({
    report: state.report,
    pages: state.report.pages,
    currentPage: state.report.builder.loaded && getCurrentPage(state.report),
    richEditorOpened: state.report.builder.richEditorOpened,
    bufferedModule: getBufferedModule(state.report),
    selected: state.report.ui.selection.selected,
    selectedPageId: state.report.ui.selection.pageId,
    modules: getModules(state.report, state.report.ui.selection.selected)
      .map(m => new ModuleModel(m, state.report.ui.selection.pageId)),
  }),
  {
    save,
    copyModule,
    pasteModule,
    updateCurrentPage,
    addModule,
    removeModule,
    updateModule,
    unselectModules: actions.unselectAll,
    selectModules: actions.selectMultiple,
    openFilter: data => openModal('filter', data),
    openDataSheet: data => openModal('dataSheetModal', data),
    openAlias: data => openModal('alias', data),
    openDataConfiguration: data => openModal('dataConfiguration', data),
    openSettings: data => openModal('reportSettings', data),
    openRemapAssessment: data => openModal('remapAssessment', data),
  },
)
