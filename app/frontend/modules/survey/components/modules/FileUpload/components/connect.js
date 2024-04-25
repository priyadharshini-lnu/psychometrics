import { connect } from 'react-redux'
import { getI18n, getMediaResponseByQuestionId } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import {
  markQuestionInProgress,
  removeQuestionInProgress,
  addMediaResponse,
  removeMediaResponse,
  setSubmissionInProgress,
} from '~/modules/survey/core/preview/FlowProcessor/actions'

export default connect(
  ({ preview }, { model }) => ({
    type: preview.type,
    mediaUrl: preview.mediaUrl,
    I18n: getI18n(preview),
    mediaResponse: getMediaResponseByQuestionId(preview, model.id),
  }),
  {
    markQuestionInProgress,
    removeQuestionInProgress,
    addMediaResponse,
    removeMediaResponse,
    setSubmissionInProgress,
  },
)
