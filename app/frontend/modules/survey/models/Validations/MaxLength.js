import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'
import { getAnswer, getValidationKey } from '~/modules/survey/utils/question'

const MaxLength = function ({ maxLength }, question) {
  this.maxLength = +maxLength
  this.question = question
}

_.extend(MaxLength.prototype, {
  validate (answers) {
    if (getAnswer(this.question, answers).length > this.maxLength) {
      return {
        type: 'MaxLength',
        message: I18n().t(`${getValidationKey(this.question)}.max_character`, { max: this.maxLength }),
      }
    }
  },
})

export default MaxLength
