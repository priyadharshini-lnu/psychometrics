import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'

const MaxLength = function ({ maxLength }) {
  this.maxLength = +maxLength
}

_.extend(MaxLength.prototype, {
  validate (answers) {
    if (answers[0].value.length > this.maxLength) {
      return {
        type: 'MaxLength',
        message: Watchman.I18n().t('validations.max_length', { max: this.maxLength }),
      }
    }
  },
})

export default MaxLength
