import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const InnovationStylesFactor = function (attrs = {}) {
  this.id = attrs.id
  this.predicate = attrs.predicate
  this.value = attrs.value
  this.position = attrs.position
  this.weight = attrs.weight
}

InnovationStylesFactor.prototype = new EventEmitter()

_.extend(InnovationStylesFactor.prototype, {
  toJSON () {
    return {
      id: this.id,
      predicate: this.predicate,
      value: this.value,
      position: this.position,
      weight: this.weight,
    }
  },

  isValid (scoring) {
    if (!scoring || !scoring.results || !scoring.results.length) { return false }
    const { value } = scoring.results[0]
    switch (this.predicate) {
      case 'equal_to':
        return value === this.value
      case 'not_equal_to':
        return value !== this.value
      case 'greater_then':
        return value > this.value
      case 'greater_then_or_equal':
        return value >= this.value
      case 'less_then':
        return value < this.value
      case 'less_then_or_equal':
        return value <= this.value
      default:
        throw new Error(`unknown predicate: ${this.predicate}`)
    }
  },
})

export default InnovationStylesFactor
