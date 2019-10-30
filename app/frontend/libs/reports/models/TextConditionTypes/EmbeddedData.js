import _ from 'lodash'
import BaseType from './BaseType'

class EmbeddedData extends BaseType {
  isFilled () {
    const {
      key, predicate, value, count,
    } = this.condition.props

    return !!(key && predicate && (value || value === 0) && (count || count === 0))
  }

  isValid () {
    return this.isFilled() && this.countByPredicateGreaterPropsCount()
  }

  countByPredicateGreaterPropsCount () {
    const { embeddedData } = this.getResults()
    const embeddedDataByKey = embeddedData[this.condition.props.key]
    if (embeddedDataByKey && embeddedDataByKey.length) {
      const count = this.countByPredicate(embeddedDataByKey)
      return count > this.condition.props.count
    }
    return false
  }

  countByPredicate (results) {
    switch (this.condition.props.predicate) {
      case 'EqualTo':
        return _.filter(results, res => res.value === this.condition.props.value).length
      case 'NotEqualTo':
        return _.filter(results, res => res.value !== this.condition.props.value).length
      case 'GreaterThen':
        return _.filter(results, res => parseFloat(res.value) > parseFloat(this.condition.props.value)).length
      case 'GreaterThenOrEqual':
        return _.filter(results, res => parseFloat(res.value) >= parseFloat(this.condition.props.value)).length
      case 'LessThen':
        return _.filter(results, res => parseFloat(res.value) < parseFloat(this.condition.props.value)).length
      case 'LessThenOrEqual':
        return _.filter(results, res => parseFloat(res.value) <= parseFloat(this.condition.props.value)).length
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  }
}

export default EmbeddedData
