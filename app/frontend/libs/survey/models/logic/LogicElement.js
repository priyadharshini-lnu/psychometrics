import _ from 'lodash'
import ConditionList from './ConditionList'
import Condition from './Condition'
import LogicResolver from './LogicResolver'

export default class LogicElement {
  constructor (attrs = {}) {
    if (attrs.conditions && attrs.conditions.length) {
      this.conditions = _.map(attrs.conditions, condition => new ConditionList(condition))
    } else {
      this.conditions = [
        new ConditionList({
          conditions: [{}],
        }),
      ]
    }
  }

  resolve () {
    const resolver = new LogicResolver(this)
    return resolver.resolve()
  }

  addNewList (condition) {
    this.conditions.push(new ConditionList({
      prefix: 'And',
      conditions: [condition || new Condition()],
    }))
  }

  removeList (list) {
    _.pull(this.conditions, list)
    if (this.conditions.length === 1) {
      this.conditions[0].prefix = null
    }
  }

  toJSON () {
    return {
      conditions: this.conditions,
    }
  }
}
