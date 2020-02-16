import _ from 'lodash'
import Validations from 'models/Validations'

const NormResolver = function (rules, hris, questions = null, results = null) {
  this.questions = questions
  this.results = results
  this.rules = rules
  this.hris = hris || {}
  this.type = null
  this.id = null
}

_.extend(NormResolver.prototype, {

  resolve () {
    _.each(this.rules, (rule) => {
      this.resolveCondition(rule)
    })
    return {
      id: this.id,
      type: this.type,
    }
  },

  resolveCondition (rule) {
    const results = _.map(rule.conditions, condition => this.processCondition(condition))
    let res = null
    _.each(results, (result, i) => {
      if (i > 0) {
        if (result.prefix === 'And') {
          res = res && result.value
        }

        if (result.prefix === 'Or') {
          res = res || result.value
        }
      } else {
        res = result.value
      }
    })

    if (res) {
      if (!this.id && rule.norm_id) {
        this.id = rule.norm_id
      }
      if (!this.type && rule.norm_type) {
        this.type = rule.norm_type
      }
    }
  },

  processCondition (condition) {
    if (condition.conditionType === 'Question') {
      return this.processQuestionCondition(condition)
    }
    if (condition.conditionType === 'Hris') {
      return {
        prefix: condition.prefix,
        value: this.hris[condition.key] === condition.value,
      }
    }
  },

  processQuestionCondition (condition) {
    const validation = new Validations.Custom(condition, this.questions, this.results)
    return validation.validate()
  },

})

export default NormResolver
