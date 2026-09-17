import { connect } from 'react-redux'
import {
  importTranslations,
  fetchQuestionCenter,
  initQuestionCenter,
} from '~/modules/survey/core/builder/questionCenter/index.ts'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.questionCenter.loaded,
    disabled: survey.builder.questionCenter.disabled,
    question: survey.builder.questionCenter.question,
  }),
  {
    fetchQuestionCenter,
    initQuestionCenter,
    importTranslations,
  },
)
