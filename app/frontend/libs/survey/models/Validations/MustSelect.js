import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const MustSelect = function ({ minValue, maxValue }, question) {
  this.question = question
  this.minValue = +minValue
  this.maxValue = +maxValue
}

_.extend(MustSelect.prototype, {
  validate (answers) {
    if (answers.length < this.minValue || answers.length > this.maxValue) {
      return {
        type: 'MustSelect',
        message: I18nStore.t('validations.must_select', { min: this.minValue, max: this.maxValue }),
      }
    }
  },
})

export default MustSelect
