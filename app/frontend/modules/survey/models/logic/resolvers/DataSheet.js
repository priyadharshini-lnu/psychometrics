import BaseResolver from './BaseResolver'

export default class DataSheetResolver extends BaseResolver {
  constructor (condition, context) {
    super()
    this.condition = condition
    this.datasheet = context.dataSheet
  }

  resolve () {
    if (this[this.condition.predicate]) {
      const subject = this.datasheet[this.condition.answer || this.condition.subject]
      return this[this.condition.predicate](subject, this.condition.value)
    }
    return true
  }
}
