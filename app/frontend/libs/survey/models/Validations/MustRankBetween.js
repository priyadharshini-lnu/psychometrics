import _ from 'lodash'
import I18nStore from 'store/I18nStore'

const MustRankBetween = function ({ minValue, maxValue }) {
  this.minValue = +minValue
  this.maxValue = +maxValue
}

_.extend(MustRankBetween.prototype, {
  validate (answers) {
    let error = false

    _.forEach(answers, (answer) => {
      const value = answer.value + 1
      if ((value) < this.minValue || (value) > this.maxValue) {
        error = true
      }
    })

    if (error) {
      return {
        type: 'MustRankBetween',
        message: I18nStore.t('validations.must_rank_between', { min: this.minValue, max: this.maxValue }),
      }
    }
  },
})

export default MustRankBetween
