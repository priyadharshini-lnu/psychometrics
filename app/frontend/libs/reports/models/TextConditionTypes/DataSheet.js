import _ from 'lodash'
import BaseType from './BaseType'

class DataSheet extends BaseType {
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
      props: { subject },
    } = this.condition
    const value = this.getResults().dataSheet && this.getResults().dataSheet[subject]
    if (_.isNil(value)) return false
    return this.compare(value)
  }

  compare (value) {
    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return String(value) === String(this.condition.props.value)
      case 'NotEqualTo':
        return String(value) !== String(this.condition.props.value)
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

export default DataSheet
