import _ from 'lodash'
import { I18n } from 'modules/survey/store/StoreWatchman'

const Least = function ({ minValue }) {
  this.minValue = +minValue
}

_.extend(Least.prototype, {
  validate (answers) {
    if (answers.length < this.minValue) {
      return {
        type: 'Least',
        message: I18n().t('validations.least', { min: this.minValue }),
      }
    }
  },
})

export default Least
