import Factors from 'commands/Factors'
import _ from 'lodash'
import BaseType from './BaseType'

class ExternalScoring extends BaseType {
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
    const {
      type,
      props: { subject },
    } = this.condition

    const value = Factors.LookupValue.getValueOrNaN(this.getResults().externalScoring, type, subject)
    if (_.isNil(value) || _.isNil(NaN)) return false
    return this.compare(value)
  }

  compare (aggregatedData) {
    const value = parseFloat(this.condition.props.value)

    if (isNaN(value) || isNaN(aggregatedData)) { return false }

    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return parseFloat(aggregatedData) === value
      case 'NotEqualTo':
        return parseFloat(aggregatedData) !== value
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

export default ExternalScoring
