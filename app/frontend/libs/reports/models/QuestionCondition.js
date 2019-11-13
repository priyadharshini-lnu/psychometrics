import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const QuestionCondition = function (attrs = {}) {
  this.subject = attrs.subject
  this.prefix = attrs.prefix
  this.answer = attrs.answer
  this.predicate = attrs.predicate
  this.type = attrs.type
  this.value = attrs.value
}

QuestionCondition.prototype = new EventEmitter()

_.extend(QuestionCondition.prototype, {
  toJSON () {
    return {
      subject: this.subject,
      prefix: this.prefix,
      answer: this.answer,
      predicate: this.predicate,
      type: this.type,
      value: this.value,
    }
  },
})

export default QuestionCondition
