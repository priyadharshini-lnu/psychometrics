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
    switch (this.condition.props.operation) {
      case 'Mean':
        return _.round(_.meanBy(results, e => e.getValue()))
      case 'Max':
        return _.maxBy(results, e => e.getValue()).getValue()
      case 'Min':
        return _.minBy(results, e => e.getValue()).getValue()
      default:
        throw new Error(`unknown operation: ${this.condition.props.operation}`)
    }
  }

  compare (aggregatedData) {
    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return aggregatedData === this.condition.props.value
      case 'NotEqualTo':
        return aggregatedData !== this.condition.props.value
      case 'GreaterThen':
        return parseFloat(aggregatedData) > parseFloat(this.condition.props.value)
      case 'GreaterThenOrEqual':
        return parseFloat(aggregatedData) >= parseFloat(this.condition.props.value)
      case 'LessThen':
        return parseFloat(aggregatedData) < parseFloat(this.condition.props.value)
      case 'LessThenOrEqual':
        return parseFloat(aggregatedData) <= parseFloat(this.condition.props.value)
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  }
}

export default Scoring
