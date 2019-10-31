import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const RuleCondition = function (attrs = {}) {
  this.setData(attrs)
}

RuleCondition.prototype = new EventEmitter()

_.extend(RuleCondition.prototype, {
  toJSON () {
    return {
      subject: this.subject,
      prefix: this.prefix,
      answer: this.answer,
      predicate: this.predicate,
      type: this.type,
      key: this.key,
      value: this.value,
      conditionType: this.conditionType,
    }
  },

  setData (attrs) {
    this.conditionType = attrs.conditionType
    this.subject = attrs.subject
    this.prefix = attrs.prefix
    this.answer = attrs.answer
    this.predicate = attrs.predicate
    this.type = attrs.type
    this.key = attrs.key
    this.value = attrs.value
  },
})

export default RuleCondition
