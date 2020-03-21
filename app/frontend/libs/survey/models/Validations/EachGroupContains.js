import _ from 'lodash'
import Watchman from 'libs/survey/store/StoreWatchman'

const EachGroupContains = function ({ minValue, maxValue }, question) {
  this.question = question
  this.minValue = +minValue
  this.maxValue = +maxValue
}

_.extend(EachGroupContains.prototype, {
  validate (answers) {
    let result = null
    _.times(this.question.props.scalePoints, (i) => {
      const objects = _.filter(answers, { scale: i })
      if (objects.length < this.minValue || objects.length > this.maxValue) {
        result = {
          type: 'EachGroupContains',
          message: Watchman.I18n().t('validations.each_group_contains', { min: this.minValue, max: this.maxValue }),
        }
      }
    })
    return result
  },
})

export default EachGroupContains
