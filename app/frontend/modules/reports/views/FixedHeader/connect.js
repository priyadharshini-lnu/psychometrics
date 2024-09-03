import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import {
  save, updateCurrentPage, unselectModules, copyModule, pasteModule, selectModule,
} from '~/modules/reports/core/builder/actions'
import { addModule } from '~/modules/reports/core/builder/page/actions'
import { removeModule, updateModule } from '~/modules/reports/core/builder/module/actions'
import { getCurrentPage, getBufferedModule, getModule } from '~/modules/reports/core/builder/selectors'

export default connect(
  state => ({
    report: state.report,
    pages: state.report.pages,
    currentPage: state.report.builder.loaded && getCurrentPage(state.report),
    richEditorOpened: state.report.builder.richEditorOpened,
    selected: state.report.builder.selected,
    bufferedModule: getBufferedModule(state.report),
    module: getModule(state.report, state.report.builder.selected?.moduleId),
  }),
  {
    save,
    copyModule,
    pasteModule,
    updateCurrentPage,
    addModule,
    removeModule,
    updateModule,
    unselectModules,
    selectModule,
    openFilter: data => openModal('filter', data),
    openDataSheet: data => openModal('dataSheetModal', data),
    openAlias: data => openModal('alias', data),
    openDataConfiguration: data => openModal('dataConfiguration', data),
    openSettings: data => openModal('reportSettings', data),
    openRemapAssessment: data => openModal('remapAssessment', data),
  },
)
