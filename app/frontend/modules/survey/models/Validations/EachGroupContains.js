import _ from 'lodash'
import { I18n } from '~/modules/survey/store/StoreWatchman'

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
      if ((this.minValue && this.maxValue) && (objects.length < this.minValue || objects.length > this.maxValue)) {
        result = {
          type: 'EachGroupContains',
          message: I18n().t('validations.each_group_contains', { min: this.minValue, max: this.maxValue }),
        }
        return
      }

      if (this.minValue && objects.length < this.minValue) {
        result = {
          type: 'EachGroupContains',
          message: I18n().t('shared.group_question_min_validation_error', { min: this.minValue }),
        }
        return
      }

      if (this.maxValue && objects.length > this.maxValue) {
        result = {
          type: 'EachGroupContains',
          message: I18n().t('shared.group_question_max_validation_error', { max: this.maxValue }),
        }
      }
    })
    return result
  },
})

export default EachGroupContains
