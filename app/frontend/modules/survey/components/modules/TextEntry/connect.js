import { connect } from 'react-redux'

import { setDictationActiveOnQuestion } from 'modules/survey/core/preview/FlowProcessor/actions'
import {
  getI18n,
  getAwsSpeechTextPresignedUrl,
  getQuestionWithActiveDictation,
} from 'modules/survey/core/preview/FlowProcessor/selectors'

export default connect(
  ({ preview }) => ({
    I18n: getI18n(preview),
    awsSpeechTextPresignedUrl: getAwsSpeechTextPresignedUrl(preview),
    activeDictationOnQuestion: getQuestionWithActiveDictation(preview),
  }),
  { setDictationActiveOnQuestion },
)
