import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'
import { openRichEditor, closeRichEditor } from 'modules/reports/core/builder/actions'
import { getQuestions } from 'modules/reports/core/builder/selectors'

export default connect(
  (state, { module, model }) => ({
    richEditorOpened: state.report.builder.richEditorOpened,
    questions: state.report.builder.loaded ? getQuestions(state.report, (module || model).assessment_id) || {} : {},
  }),
  {
    openConditionalText: data => openModal('conditionalText', data),
    openConditionalFactorOccupationText: data => openModal('conditionalFactorOccupationText', data),
    openRichEditor,
    closeRichEditor,
  },
)
