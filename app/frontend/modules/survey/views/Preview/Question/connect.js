import { connect } from 'react-redux'
import { moduleConfig } from '~/modules/survey/core/builder/assessment/question/selectors'
import { getQuestionErrors, getQuestionResults } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import {
  nextPage,
} from '~/modules/survey/core/preview/FlowProcessor/actions'

export default connect(
  ({ preview }, { model }) => ({
    hideHiddenQuestions: preview.hideHiddenQuestions,
    randomseed: preview.randomseed,
    isAssessor: preview.isAssessor,
    linkedQuestions: preview.linkedQuestions?.[model.id],
    moduleConfig: moduleConfig(preview, model.id),
    errors: getQuestionErrors(preview, model.id),
    result: getQuestionResults(preview, model.id),
  }),
  {
    nextPage,
  },
)
