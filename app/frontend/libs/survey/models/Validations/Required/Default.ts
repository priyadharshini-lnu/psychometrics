import { getValidationKey } from 'libs/survey/utils/question'
import Watchman from 'libs/survey/store/StoreWatchman'
import { QuestionError, Question } from 'libs/survey/core/preview/FlowProcessor/interfaces'

interface ModuleResult {
  result: { question: Question },
  requiredValidation(): boolean
}

const DefaultValidation = {
  run (moduleResult: ModuleResult) {
    const errors: QuestionError[] = []
    const { result: { question } } = moduleResult
    debugger
    if (!moduleResult.requiredValidation()) {
      const validationMessage = Watchman.I18n().lookup(`${getValidationKey(question)}.required`)
        || Watchman.I18n().t('validations.required')

      errors.push({ type: 'forceRequired', message: validationMessage })
    }
    return errors
  },
}

export default DefaultValidation
