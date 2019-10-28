import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const CharacterRange = function ({ minLength, maxLength }) {
  this.minLength = +minLength
  this.maxLength = +maxLength
}

_.extend(CharacterRange.prototype, {
  validate (answers) {
    if (answers[0].value.length < this.minLength || answers[0].value.length > this.maxLength) {
      return {
        type: 'CharacterRange',
        message: I18nStore.t('validations.character_range', { min: this.minLength, max: this.maxLength }),
      }
    }
  },
})

export default CharacterRange
