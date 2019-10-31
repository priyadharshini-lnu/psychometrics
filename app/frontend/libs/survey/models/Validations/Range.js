import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const Range = function ({ minValue, maxValue }) {
  this.minValue = +minValue
  this.maxValue = +maxValue
}

_.extend(Range.prototype, {
  validate (answers) {
    if (answers.length < this.minValue || answers.length > this.maxValue) {
      return {
        type: 'Range',
        message: I18nStore.t('validations.range', { min: this.minValue, max: this.maxValue }),
      }
    }
  },
})

export default Range
