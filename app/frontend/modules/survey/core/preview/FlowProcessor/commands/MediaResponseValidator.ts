import _ from 'lodash'
import { getValidationKey, isMandatory } from '~/modules/survey/utils/question'
import { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { Question } from '../interfaces'

const { I18n } = window

const MediaResponseValidator = {
  run (question: Question, mediaResponses: MediaResponse[]) {
    if (isMandatory(question)) {
      const mediaResponse = mediaResponses.length > 1
        ? _.find(mediaResponses, mr => (mr.questionId === question.id && mr.userSelected))
        : mediaResponses[0]
      if (!mediaResponse || !mediaResponse?.url) {
        const validationMessage = I18n.lookup(`${getValidationKey(question)}.required`)
          || I18n.t('validations.required')

        return [{ type: 'forceRequired', message: validationMessage }]
      }
    }
    return []
  },
}

export default MediaResponseValidator
