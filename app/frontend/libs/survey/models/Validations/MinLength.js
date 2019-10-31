import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const MinLength = function ({ minLength }) {
  this.minLength = +minLength
}

_.extend(MinLength.prototype, {
  validate (answers) {
    if (answers[0].value.length < this.minLength) {
      return {
        type: 'MinLength',
        message: I18nStore.t('validations.min_length', { min: this.minLength }),
      }
    }
  },
})

export default MinLength
