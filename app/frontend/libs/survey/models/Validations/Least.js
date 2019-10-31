import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const Least = function ({ minValue }) {
  this.minValue = +minValue
}

_.extend(Least.prototype, {
  validate (answers) {
    if (answers.length < this.minValue) {
      return {
        type: 'Least',
        message: I18nStore.t('validations.least', { min: this.minLength }),
      }
    }
  },
})

export default Least
