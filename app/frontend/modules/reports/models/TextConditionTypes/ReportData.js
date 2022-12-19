import BaseType from './BaseType'

class ReportData extends BaseType {
  isFilled () {
    const {
      key, predicate, count,
    } = this.condition.props

    return !!(key && predicate && (count || count === 0))
  }

  isValid () {
    if (!this.isFilled()) return false
    const { reportData } = this.getResults()

    const value = reportData[this.condition.props.key]

    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return value === this.condition.props.count
      case 'NotEqualTo':
        return value !== this.condition.props.count
      case 'GreaterThen':
        return parseFloat(value) > parseFloat(this.condition.props.count)
      case 'GreaterThenOrEqual':
        return parseFloat(value) >= parseFloat(this.condition.props.count)
      case 'LessThen':
        return parseFloat(value) < parseFloat(this.condition.props.count)
      case 'LessThenOrEqual':
        return parseFloat(value) <= parseFloat(this.condition.props.count)
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  }
}

export default ReportData
