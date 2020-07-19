import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const CPICondition = function (attrs = {}) {
  this.type = attrs.type
  this.setProps(attrs.props)
}

CPICondition.prototype = new EventEmitter()

_.extend(CPICondition.prototype, {
  setProps (props) {
    this.props = props || {}
  },

  toJSON () {
    return {
      type: this.type,
      props: this.props,
    }
  },

  isValid (scoring) {
    if (this.props.predicate
      && (this.props.value || this.props.value === 0)) {
      return this.compare(scoring)
    }
    return false
  },

  compare (scoring) {
    switch (this.props.predicate) {
      case 'EqualTo':
        return scoring === this.props.value
      case 'NotEqualTo':
        return scoring !== this.props.value
      case 'GreaterThen':
        return scoring > this.props.value
      case 'GreaterThenOrEqual':
        return scoring >= this.props.value
      case 'LessThen':
        return scoring < this.props.value
      case 'LessThenOrEqual':
        return scoring <= this.props.value
      default:
        throw new Error(`unknown predicate: ${this.condition.props.predicate}`)
    }
  },

})

export default CPICondition
