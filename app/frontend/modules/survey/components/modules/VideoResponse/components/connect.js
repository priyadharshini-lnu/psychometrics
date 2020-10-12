import { connect } from 'react-redux'
import {
  getI18n,
  isAssessmentTimedOut,
  getMediaResponsesByQuestionId,
} from 'modules/survey/core/preview/FlowProcessor/selectors'
import {
  markQuestionInProgress,
  removeQuestionInProgress,
  addMediaResponse,
  removeMediaResponse,
} from 'modules/survey/core/preview/FlowProcessor/actions'

export default connect(
  ({ preview }, { model }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
    isAssessmentTimedOut: isAssessmentTimedOut(preview),
    mediaResponses: getMediaResponsesByQuestionId(preview, model.id),
  }),
  {
    markQuestionInProgress,
    removeQuestionInProgress,
    addMediaResponse,
    removeMediaResponse,
  },
)
