import { getValidationKey } from '~/modules/survey/utils/question'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface ModuleResult {
  result: { question: Question, answers: { code: string, value: string }[] },
  requiredValidation(): boolean
  results(): { to: string, subject: string }
}

const CampaignFactorFeedbackValidation = {
  run (moduleResult: ModuleResult) {
    const { result: { question, answers } } = moduleResult

    const filledAnswers = answers.filter(answer => answer.code && answer.value)
    if (filledAnswers.length < question.props.minFactors) {
      return {
        type: 'MinLength',
        message: I18n().t(`${getValidationKey(question)}.min_factor`, { min: question.props.minFactors }),
      }
    }

    return []
  },
}

export default CampaignFactorFeedbackValidation
