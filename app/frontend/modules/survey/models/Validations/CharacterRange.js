import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswersByLength, getValidationKey } from '~/modules/survey/utils/question'

const CharacterRange = function ({ minLength, maxLength }, question) {
  this.minLength = +minLength
  this.maxLength = +maxLength
  this.question = question
}

_.extend(CharacterRange.prototype, {
  validate (answers) {
    const shortestAnswer = getAnswersByLength(this.question, answers).shortest
    const longestAnswer = getAnswersByLength(this.question, answers).longest
    if (shortestAnswer.length < this.minLength || longestAnswer.length > this.maxLength) {
      return {
        type: 'CharacterRange',
        message: I18n().t(`${getValidationKey(this.question)}.character_range`,
          { min: this.minLength, max: this.maxLength }),
      }
    }
  },
})

export default CharacterRange
