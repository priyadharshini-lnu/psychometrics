import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'

const MinLength = function ({ minLength }) {
  this.minLength = +minLength
}

_.extend(MinLength.prototype, {
  validate (answers) {
    if (answers[0].value.length < this.minLength) {
      return {
        type: 'MinLength',
        message: Watchman.I18n().t('validations.min_length', { min: this.minLength }),
      }
    }
  },
})

export default MinLength
