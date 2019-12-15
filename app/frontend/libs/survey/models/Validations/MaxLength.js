import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const MaxLength = function ({ maxLength }) {
  this.maxLength = +maxLength
}

_.extend(MaxLength.prototype, {
  validate (answers) {
    if (answers[0].value.length > this.maxLength) {
      return {
        type: 'MaxLength',
        message: I18nStore.t('validations.max_length', { max: this.maxLength }),
      }
    }
  },
})

export default MaxLength
