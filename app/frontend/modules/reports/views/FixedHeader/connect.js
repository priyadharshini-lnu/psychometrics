import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'
import {
  save, updateCurrentPage, unselectModules, copyModule, pasteModule, selectModule,
} from 'modules/reports/core/builder/actions'
import { addModule } from 'modules/reports/core/builder/page/actions'
import { removeModule } from 'modules/reports/core/builder/module/actions'
import { getCurrentPage, getBufferedModule } from 'modules/reports/core/builder/selectors'

export default connect(
  state => ({
    report: state.report,
    currentPage: state.report.builder.loaded && getCurrentPage(state.report),
    richEditorOpened: state.report.builder.richEditorOpened,
    selected: state.report.builder.selected,
    bufferedModule: getBufferedModule(state.report),
  }),
  {
    save,
    copyModule,
    pasteModule,
    updateCurrentPage,
    addModule,
    removeModule,
    unselectModules,
    selectModule,
    openFilter: data => openModal('filter', data),
    openDataSheet: data => openModal('dataSheet', data),
    openAlias: data => openModal('alias', data),
    openDataConfiguration: data => openModal('dataConfiguration', data),
  },
)
