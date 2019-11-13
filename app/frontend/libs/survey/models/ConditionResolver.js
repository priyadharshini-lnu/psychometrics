import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Validations from 'models/Validations'
import store from 'store/AssessmentPreviewStore'

const ConditionResolver = function (conditions) {
  this.conditions = conditions
}

ConditionResolver.prototype = new EventEmitter()

_.extend(ConditionResolver.prototype, {

  resolve () {
    return this.processAll()
  },

  // TODO (atanych): should be implemented remaining types
  isFilled () {
    return _.every(this.conditions, (condition) => {
      if (condition.conditionType === 'Question') {
        const question = _.find(store.questions, { id: condition.subject })
        return question && question.result && !question.result.isEmpty()
      }

      if (condition.conditionType === 'DeviceType') {
        return true
      }

      if (condition.conditionType === 'EmbeddedData') {
        return true
      }

      if (condition.conditionType === 'GeoIP') {
        return true
      }
    })
  },

  processAll () {
    const results = _.map(this.conditions, condition => this.processValidation(condition))
    let res = null
    let prev = null
    _.each(results, (result) => {
      if (prev) {
        if (result.prefix === 'And') {
          res = res.value && result.value
        }

        if (result.prefix === 'Or') {
          res = res.value || result.value
        }
      } else {
        res = result.value
      }
      prev = result
    })
    return res
  },

  // TODO (atanych): should be implemented remaining types
  processValidation (condition) {
    if (condition.conditionType === 'Question') {
      return this.processQuestionValidation(condition)
    }

    if (condition.conditionType === 'DeviceType') {
      return {}
    }

    if (condition.conditionType === 'EmbeddedData') {
      return {}
    }

    if (condition.conditionType === 'GeoIP') {
      return {}
    }
  },

  processQuestionValidation (condition) {
    const validation = new Validations.Custom(condition)
    return validation.validate()
  },

})

export default ConditionResolver
