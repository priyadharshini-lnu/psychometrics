import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const QuestionCondition = function (attrs = {}) {
  this.setData(attrs)
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
      // For SkipLogic
      destination: this.destination,
      destinationBlock: this.destinationBlock,
    }
  },

  setData (attrs) {
    this.subject = attrs.subject
    this.prefix = attrs.prefix
    this.answer = attrs.answer
    this.predicate = attrs.predicate
    this.type = attrs.type
    this.value = attrs.value
    // For SkipLogic
    this.destination = attrs.destination
    this.editMode = attrs.editMode || false
    this.destinationBlock = attrs.destinationBlock
  },
})

export default QuestionCondition
