import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { openRichEditor, closeRichEditor } from '~/modules/reports/core/builder/actions'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

export default connect(
  (state, { modules, module }) => ({
    richEditorOpened: state.report.builder.richEditorOpened,
    questions: getQuestions(state.report, (module || modules[0]).assessment_id) || {},
    reportStyles: state.report.builder.styles,
  }),
  dispatch => ({
    openConditionalText: data => dispatch(openModal('conditionalText', data)),
    openConditionalFactorOccupationText: data => dispatch(openModal('conditionalFactorOccupationText', data)),
    openRichEditor: (...args) => dispatch(openRichEditor(...args)),
    closeRichEditor: (...args) => dispatch(closeRichEditor(...args)),
  }),
)
