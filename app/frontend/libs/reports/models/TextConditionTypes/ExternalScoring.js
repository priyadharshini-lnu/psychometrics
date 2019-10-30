import Factors from 'rb/commands/Factors'
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

    const value = Factors.LookupValue.call(this.getResults().externalScoring, type, subject)
    if (_.isNil(value)) return false
    return this.compare(value)
  }

  compare (value) {
    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return value === this.condition.props.value
      case 'NotEqualTo':
        return value !== this.condition.props.value
      case 'GreaterThen':
        return parseFloat(value) > parseFloat(this.condition.props.value)
      case 'GreaterThenOrEqual':
        return parseFloat(value) >= parseFloat(this.condition.props.value)
      case 'LessThen':
        return parseFloat(value) < parseFloat(this.condition.props.value)
      case 'LessThenOrEqual':
        return parseFloat(value) <= parseFloat(this.condition.props.value)
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  }
}

export default ExternalScoring
