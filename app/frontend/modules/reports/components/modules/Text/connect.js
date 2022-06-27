import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/ui/modals'
import { openRichEditor, closeRichEditor } from 'modules/reports/core/builder/actions'
import { getQuestions } from 'modules/reports/core/builder/selectors'
import {
  createTextOverride, updateTextOverride, approveTextOverride, removeTextOverride,
} from 'modules/admin/modules/campaigns/core/userReports'

export default connect(
  (state, { module, model, rstore }) => ({
    richEditorOpened: state.report.builder.richEditorOpened,
    questions: state.report.builder.loaded ? getQuestions(state.report, (module || model).assessment_id) || {} : {},
    campaignId: state.report.builder.campaignId,
    userReport: rstore?.getState().campaigns.userReports.current,
  }),
  (dispatch, { rstore }) => ({
    openConditionalText: data => dispatch(openModal('conditionalText', data)),
    openConditionalFactorOccupationText: data => dispatch(openModal('conditionalFactorOccupationText', data)),
    openRichEditor: (...args) => dispatch(openRichEditor(...args)),
    closeRichEditor: (...args) => dispatch(closeRichEditor(...args)),
    approveTextOverride: (...args) => rstore.dispatch(approveTextOverride(...args)),
    removeTextOverride: (...args) => rstore.dispatch(removeTextOverride(...args)),
    openReviewEditor: () => rstore.dispatch(openRichEditor()),
    closeReviewEditor: () => rstore.dispatch(closeRichEditor()),
    createTextOverride: (...args) => rstore.dispatch(createTextOverride(...args)),
    updateTextOverride: (...args) => rstore.dispatch(updateTextOverride(...args)),
  }),
)
