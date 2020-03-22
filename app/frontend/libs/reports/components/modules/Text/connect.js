import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { openRichEditor, closeRichEditor } from 'libs/reports/core/builder/actions'

export default connect(
  state => ({
    richEditorOpened: state.report.builder.richEditorOpened,
  }),
  {
    openConditionalText: data => openModal('conditionalText', data),
    openConditionalFactorOccupationText: data => openModal('conditionalFactorOccupationText', data),
    openRichEditor,
    closeRichEditor,
  },
)
