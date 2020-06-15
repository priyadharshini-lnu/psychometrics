import _ from 'lodash'
import { I18n } from 'libs/survey/store/StoreWatchman'

const MinLength = function ({ minLength }) {
  this.minLength = +minLength
}

_.extend(MinLength.prototype, {
  validate (answers) {
    if (answers[0].value.length < this.minLength) {
      return {
        type: 'MinLength',
        message: I18n().t('validations.min_length', { min: this.minLength }),
      }
    }
  },
})

export default MinLength
