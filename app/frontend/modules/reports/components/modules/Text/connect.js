import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { openRichEditor, closeRichEditor } from '~/modules/reports/core/builder/actions'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

export default connect(
  (state, { module, model }) => ({
    richEditorOpened: state.report.builder.richEditorOpened,
    questions: state.report.builder.loaded ? getQuestions(state.report, (module || model).assessment_id) || {} : {},
    reportStyles: state.report.builder.styles,
  }),
  dispatch => ({
    openConditionalText: data => dispatch(openModal('conditionalText', data)),
    openConditionalFactorOccupationText: data => dispatch(openModal('conditionalFactorOccupationText', data)),
    openRichEditor: (...args) => dispatch(openRichEditor(...args)),
    closeRichEditor: (...args) => dispatch(closeRichEditor(...args)),
  }),
)
