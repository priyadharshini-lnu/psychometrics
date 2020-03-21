import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'

const Least = function ({ minValue }) {
  this.minValue = +minValue
}

_.extend(Least.prototype, {
  validate (answers) {
    if (answers.length < this.minValue) {
      return {
        type: 'Least',
        message: Watchman.I18n().t('validations.least', { min: this.minValue }),
      }
    }
  },
})

export default Least
