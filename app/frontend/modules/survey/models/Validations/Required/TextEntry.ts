import _ from 'lodash'
import { getValidationKey, isEmailTextEntryQuestion } from '~/modules/survey/utils/question'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { QuestionError, Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import DefaultValidation from './Default'

interface ModuleResult {
  result: { question: Question },
  requiredValidation(): boolean
  results(): { to: string, subject: string }
}

const TextEntryValidation = {
  run (moduleResult: ModuleResult) {
    const errors: QuestionError[] = []
    const { result: { question } } = moduleResult

    if (!isEmailTextEntryQuestion(question)) { return DefaultValidation.run(moduleResult) }

    const { to, subject } = moduleResult.results() || {}

    if (_.isEmpty(to)) {
      errors.push({
        type: 'forceRequired',
        message: I18n().t(`${getValidationKey(question)}.to.required`),
        field: 'to',
      })
    }

    if (!subject || subject.length < 10) {
      errors.push({
        type: 'forceRequired',
        message: I18n().t(`${getValidationKey(question)}.subject.min_length`),
        field: 'subject',
      })
    }

    return errors
  },
}

export default TextEntryValidation
