import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Validations from './Validations'
import FlowDatasheetResolver from './logic/resolvers/FlowDatasheetResolver'
import UserType from './logic/resolvers/UserType'

const ConditionResolver = function (conditions, {
  questions, results, dataSheet, subjectDataSheet, relationship, isAnonymousAssessment,
}) {
  this.conditions = conditions
  this.questions = questions
  this.results = results
  this.dataSheet = dataSheet
  this.subjectDataSheet = subjectDataSheet
  this.relationship = relationship
  this.isAnonymousAssessment = isAnonymousAssessment
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
        const question = _.find(this.questions, { id: condition.subject })
        return question && question.result && !question.result.isEmpty()
      }

      if (condition.conditionType === 'EvaluatorRelationship') {
        return condition.predicate && condition.value
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

      if (condition.conditionType === 'UserType') {
        return !!(condition.predicate && condition.value)
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
          res = res && result.value
        }

        if (result.prefix === 'Or') {
          res = res || result.value
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

    if (condition.conditionType === 'UserType') {
      return { value: new UserType(condition, { isAnonymousAssessment: this.isAnonymousAssessment }).resolve() }
    }

    if (condition.conditionType === 'DataSheet') {
      return FlowDatasheetResolver.run(condition, this.dataSheet)
    }

    if (condition.conditionType === 'SubjectDataSheet') {
      return FlowDatasheetResolver.run(condition, this.subjectDataSheet)
    }

    if (condition.conditionType === 'EvaluatorRelationship') {
      const role = this.relationship
      if (condition.predicate === 'EqualTo') {
        return { prefix: condition.prefix || 'Or', value: role === condition.value }
      }

      return { prefix: condition.prefix || 'Or', value: role !== condition.value }
    }
  },

  processQuestionValidation (condition) {
    const validation = new Validations.Custom(condition, this.questions, this.results)
    return validation.validate()
  },

})

export default ConditionResolver
