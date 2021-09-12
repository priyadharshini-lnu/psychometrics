import extend from 'lodash/extend'
import { I18n } from 'modules/survey/store/StoreWatchman'

const Most = function ({ maxValue }) {
  this.maxValue = +maxValue
}

extend(Most.prototype, {
  validate (answers) {
    if (answers.length > this.maxValue) {
      return {
        type: 'Most',
        message: I18n().t('validations.most', { max: this.maxValue }),
      }
    }
  },
})

export default Most
