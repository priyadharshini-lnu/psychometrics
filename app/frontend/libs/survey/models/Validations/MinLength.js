import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'
import { getAnswer, getValidationKey } from 'libs/survey/utils/question'

const MinLength = function ({ minLength }, question) {
  this.minLength = +minLength
  this.question = question
}

_.extend(MinLength.prototype, {
  validate (answers) {
    if (getAnswer(this.question, answers).length < this.minLength) {
      return {
        type: 'MinLength',
        message: Watchman.I18n().t(`${getValidationKey(this.question)}.min_length`, { min: this.minLength }),
      }
    }
  },
})

export default MinLength
