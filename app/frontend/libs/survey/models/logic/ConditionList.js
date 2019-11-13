import _ from 'lodash'
import Condition from './Condition'

export default class ConditionList {
  constructor (attrs) {
    this.prefix = attrs.prefix || 'And'
    this.conditions = _.map(attrs.conditions, condition => new Condition(condition))
  }

  toJSON () {
    return {
      prefix: this.prefix,
      conditions: this.conditions,
    }
  }
}
