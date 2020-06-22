import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'
import { getAnswer, getValidationKey } from 'libs/survey/utils/question'

const MaxLength = function ({ maxLength }, question) {
  this.maxLength = +maxLength
  this.question = question
}

_.extend(MaxLength.prototype, {
  validate (answers) {
    if (getAnswer(this.question, answers).length > this.maxLength) {
      return {
        type: 'MaxLength',
        message: Watchman.I18n().t(`${getValidationKey(this.question)}.max_length`, { max: this.maxLength }),
      }
    }
  },
})

export default MaxLength
