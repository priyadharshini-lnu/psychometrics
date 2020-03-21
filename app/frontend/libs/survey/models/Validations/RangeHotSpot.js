import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'

const RangeHotSpot = function ({ minValue, maxValue }) {
  this.minValue = +minValue
  this.maxValue = +maxValue
}

_.extend(RangeHotSpot.prototype, {
  validate (answers) {
    const compactAnswers = _.remove(answers, { value: null })
    if (compactAnswers.length < this.minValue || compactAnswers.length > this.maxValue) {
      return {
        type: 'RangeHotSpot',
        message: Watchman.I18n().t('validations.range', { min: this.minValue, max: this.maxValue }),
      }
    }
  },
})

export default RangeHotSpot
