import store from 'store/AssessmentPreviewStore'
import BaseResolver from './BaseResolver'

export default class DataSheetResolver extends BaseResolver {
  constructor (condition) {
    super()
    this.condition = condition
    this.datasheet = store.dataSheet
  }

  resolve () {
    if (this[this.condition.predicate]) {
      return this[this.condition.predicate](this.datasheet[this.condition.answer], +this.condition.value)
    }
    return true
  }
}
