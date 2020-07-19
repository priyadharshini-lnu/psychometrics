import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const FlowCondition = function (attrs = {}) {
  this.setData(attrs)
}

FlowCondition.prototype = new EventEmitter()

_.extend(FlowCondition.prototype, {

  setData (attrs) {
    this.conditionType = attrs.conditionType || 'Question'
    this.subject = attrs.subject
    this.prefix = attrs.prefix
    this.answer = attrs.answer
    this.predicate = attrs.predicate
    this.type = attrs.type
    this.value = attrs.value
  },

  toJSON () {
    return {
      conditionType: this.conditionType,
      type: this.type,
      subject: this.subject,
      prefix: this.prefix,
      answer: this.answer,
      predicate: this.predicate,
      value: this.value,
    }
  },
})

export default FlowCondition
