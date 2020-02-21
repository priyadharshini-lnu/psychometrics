import _ from 'lodash'
import store from 'store/AppStore'
import Validations from 'models/Validations'
import Resolvers from './resolvers'

export default class LogicResolver {
  constructor (logic, questions, results) {
    this.logic = logic
    this.questions = questions || store.questions
    this.results = results
  }

  resolve () {
    if (!this.logic || !this.logic.conditions) { return false }
    const results = this.resolveTopConditions(this.logic.conditions)
    if (results.length > 1) {
      return this.checkResults(results)
    }
    return results[0].value
  }

  resolveTopConditions (list) {
    const results = []
    list.map((conditionItem) => {
      results.push({
        prefix: conditionItem.prefix,
        value: this.resolveConditions(conditionItem.conditions),
      })
    })
    return results
  }

  resolveConditions (conditions) {
    const results = []
    conditions.map((condition) => {
      results.push({
        prefix: condition.prefix,
        value: this.resolveCondition(condition),
      })
    })
    if (results.length > 1) {
      return this.checkResults(results)
    }
    return results[0].value
  }

  resolveCondition (condition) {
    if (this.isFilled(condition)) {
      return this.resolveConditionByType(condition)
    }
    return true
  }

  resolveConditionByType (condition) {
    const Resolver = Resolvers[condition.conditionType]
    return new Resolver(condition, this.questions).resolve(this.results)
  }

  checkResults (results) {
    let res = null
    let prev = null
    // TODO: implement logic to avoid checking all conditions for and/or
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
  }

  isFilled () {
    return _.every(this.conditions, (condition) => {
      if (condition.conditionType === 'Question') {
        const question = _.find(this.questions, { id: condition.subject })
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
  }

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
  }

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
  }

  processQuestionValidation (condition) {
    const validation = new Validations.Custom(condition)
    return validation.validate()
  }
}
