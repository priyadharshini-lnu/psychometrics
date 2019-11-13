import _ from 'lodash'
import Command from 'rb/utils/Command'
import Resolvers from './resolvers'

export default class LogicResolver extends Command {
  constructor (logic) {
    super()
    this.logic = logic
  }

  run () {
    if (!this.logic) { return true }
    return this.resolve()
  }

  resolve () {
    const results = this.logic.conditions.map(({ prefix, conditions }) => ({
      prefix,
      value: this.resolveConditions(conditions),
    }))
    return this.checkResults(results)
  }

  resolveConditions (conditions) {
    const results = conditions.map(condition => ({
      prefix: condition.prefix,
      value: this.resolveCondition(condition),
    }))
    return this.checkResults(results)
  }

  resolveCondition = (condition) => {
    const Resolver = Resolvers[condition.conditionType]
    return new Resolver(condition).resolve()
  }

  checkResults = (results) => {
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
}
