import _ from 'lodash'
import { I18n } from 'libs/survey/store/StoreWatchman'

const LeastHotSpot = function ({ minValue }) {
  this.minValue = +minValue
}

_.extend(LeastHotSpot.prototype, {
  validate (answers) {
    const compactAnswers = _.remove(answers, { value: null })
    if (compactAnswers.length < this.minValue) {
      return {
        type: 'LeastHotSpot',
        message: I18n().t('validations.least_hotspot', { min: this.minValue }),
      }
    }
  },
})

export default LeastHotSpot
