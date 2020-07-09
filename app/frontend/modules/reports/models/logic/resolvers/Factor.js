import ResultStore from 'rb/store/ResultStore'
import ResultManager from './ResultManager'
import BaseResolver from './BaseResolver'

export default class FactorResolver extends BaseResolver {
  constructor (condition) {
    super()
    this.condition = condition
    this.results = ResultManager.getResultsByFilter(condition.filterId)
  }

  resolve () {
    if (!ResultStore.realResults) {
      return true
    }

    if (!this.isFilled()) { return false }
    if (this[this.condition.type]) {
      const typeValue = this[this.condition.type]()
      return this[this.condition.predicate](typeValue, +this.condition.value)
    }
    return true
  }

  isFilled () {
    const { condition } = this
    return condition.answer && condition.value
  }

  getScoring () {
    return this.results.scoring[this.condition.answer]
  }

  Mean () {
    const scoring = this.getScoring()
    const sum = _.sumBy(scoring.results, 'value')
    return sum / scoring.results.length
  }

  RespondentsCount () {
    const scoring = this.getScoring()
    return scoring.results.length
  }

  Sum () {
    const scoring = this.getScoring()
    return _.sumBy(scoring.results, 'value')
  }

  Minimum () {
    const scoring = this.getScoring()
    const min = _.minBy(scoring.results, 'value')
    return min && min.value
  }

  Maximum () {
    const scoring = this.getScoring()
    const max = _.minBy(scoring.results, 'value')
    return max && max.value
  }
}
