import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  state => ({
    richEditorOpened: state.report.builder.richEditorOpened,
  }),
  {
    openFilter: data => openModal('filter', data),
    openDataSheet: data => openModal('dataSheet', data),
    openAlias: data => openModal('alias', data),
    openDataConfiguration: data => openModal('dataConfiguration', data),
  },
)
