export default class Condition {
  constructor (attrs = {}) {
    this.setData(attrs)
  }

  setData (attrs) {
    this.conditionType = attrs.conditionType || 'Question'
    this.filterId = attrs.filterId // for question
    this.subject = attrs.subject
    this.prefix = attrs.prefix || 'And'
    this.answer = attrs.answer
    this.predicate = attrs.predicate
    this.type = attrs.type
    this.value = attrs.value
  }

  setProps (props) {
    Object.assign(this, props)
  }

  reset () {
    this.setData({
      prefix: this.prefix,
      conditionType: this.conditionType,
    })
  }

  toJSON () {
    return {
      conditionType: this.conditionType,
      filterId: this.filterId,
      type: this.type,
      subject: this.subject,
      prefix: this.prefix,
      answer: this.answer,
      predicate: this.predicate,
      value: this.value,
    }
  }
}
