import _ from 'lodash'
import BaseType from './BaseType'

class Scoring extends BaseType {
  isFilled () {
    const {
      operation, predicate, subject, value,
    } = this.condition.props

    return !!(operation && predicate && subject && (value || value === 0))
  }

  isValid () {
    return this.isFilled() && this.compareAggregatedData()
  }

  compareAggregatedData () {
    const { scoring } = this.getResults()
    const factorData = scoring[parseInt(this.condition.props.subject, 10)]
    if (factorData && factorData.results.length) {
      const { results } = factorData
      const aggregatedData = this.aggregate(results)
      return this.compare(aggregatedData)
    }
    return false
  }

  aggregate (results) {
    let min; let max
    switch (this.condition.props.operation) {
      case 'Mean':
        return _.round(_.meanBy(results, e => e.getValueOrNaN()))
      case 'Max':
        max = _.maxBy(results, e => e.getValueOrNaN())
        return max && max.getValueOrNaN()
      case 'Min':
        min = _.minBy(results, e => e.getValueOrNaN())
        return min && min.getValueOrNaN()
      default:
        throw new Error(`unknown operation: ${this.condition.props.operation}`)
    }
  }

  compare (aggregatedData) {
    const value = parseFloat(this.condition.props.value)

    if (isNaN(value) || isNaN(aggregatedData)) { return false }

    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return aggregatedData === value
      case 'NotEqualTo':
        return aggregatedData !== value
      case 'GreaterThen':
        return parseFloat(aggregatedData) > value
      case 'GreaterThenOrEqual':
        return parseFloat(aggregatedData) >= value
      case 'LessThen':
        return parseFloat(aggregatedData) < value
      case 'LessThenOrEqual':
        return parseFloat(aggregatedData) <= value
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  }
}

export default Scoring
