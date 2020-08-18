import { getValidationKey } from 'modules/survey/utils/question'
import { I18n } from 'modules/survey/store/StoreWatchman'
import { QuestionError, Question } from 'modules/survey/core/preview/FlowProcessor/interfaces'

interface ModuleResult {
  result: { question: Question },
  requiredValidation(): boolean
}

const DefaultValidation = {
  run (moduleResult: ModuleResult) {
    const errors: QuestionError[] = []
    const { result: { question } } = moduleResult
    if (!moduleResult.requiredValidation()) {
      const validationMessage = I18n().lookup(`${getValidationKey(question)}.required`)
        || I18n().t('validations.required')

      errors.push({ type: 'forceRequired', message: validationMessage })
    }
    return errors
  },
}

export default DefaultValidation
