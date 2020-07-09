import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import RuleCondition from './RuleCondition'

const Rule = function (attrs = {}, assessment) {
  this.assessment = assessment
  this.norm_id = attrs.norm_id
  this.norm_type = attrs.norm_type
  this.conditions = attrs.conditions
  if (this.conditions && this.conditions.length) {
    this.conditions = _.map(this.conditions, condition => new RuleCondition(condition))
  }
}

Rule.prototype = new EventEmitter()

_.extend(Rule.prototype, {

  remove () {
    _.remove(this.assessment.norm_rules, this)
  },

  toJSON () {
    return {
      norm_id: this.norm_id,
      norm_type: this.norm_type,
      conditions: this.conditions,
    }
  },
})

export default Rule
