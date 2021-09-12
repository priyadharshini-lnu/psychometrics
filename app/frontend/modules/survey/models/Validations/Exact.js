import extend from 'lodash/extend'
import { I18n } from 'modules/survey/store/StoreWatchman'

const Exact = function ({ exactValue }) {
  this.exactValue = +exactValue
}

extend(Exact.prototype, {
  validate (answers) {
    if (answers.length !== this.exactValue) {
      return {
        type: 'Exact',
        message: I18n().t('validations.exact', { count: this.exactValue }),
      }
    }
  },
})

export default Exact
