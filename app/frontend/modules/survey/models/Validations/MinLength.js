import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswersByLength, getValidationKey } from '~/modules/survey/utils/question'

const MinLength = function ({ minLength }, question) {
  this.minLength = +minLength
  this.question = question
}

_.extend(MinLength.prototype, {
  validate (answers) {
    if (getAnswersByLength(this.question, answers).shortest.length < this.minLength) {
      return {
        type: 'MinLength',
        message: I18n().t(`${getValidationKey(this.question)}.min_character`, { min: this.minLength }),
      }
    }
  },
})

export default MinLength
