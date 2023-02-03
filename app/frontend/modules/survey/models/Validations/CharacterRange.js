import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswer, getValidationKey } from '~/modules/survey/utils/question'

const CharacterRange = function ({ minLength, maxLength }, question) {
  this.minLength = +minLength
  this.maxLength = +maxLength
  this.question = question
}

_.extend(CharacterRange.prototype, {
  validate (answers) {
    const answer = getAnswer(this.question, answers)
    if (answer.length < this.minLength || answer.length > this.maxLength) {
      return {
        type: 'CharacterRange',
        message: I18n().t(`${getValidationKey(this.question)}.character_range`,
          { min: this.minLength, max: this.maxLength }),
      }
    }
  },
})

export default CharacterRange
