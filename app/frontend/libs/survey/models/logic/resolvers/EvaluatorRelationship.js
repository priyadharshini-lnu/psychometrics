import BaseResolver from './BaseResolver'

export default class EvaluatorRelationshipResolver extends BaseResolver {
  constructor (condition, context = {}) {
    super()
    this.condition = condition
    this.result = context.relationship
  }

  resolve () {
    if (this[this.condition.predicate]) {
      return this[this.condition.predicate](this.result, this.condition.value)
    }
    return true
  }
}
