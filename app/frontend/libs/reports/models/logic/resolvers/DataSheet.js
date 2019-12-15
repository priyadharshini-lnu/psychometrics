import ResultStore from 'rb/store/ResultStore'
import ResultManager from './ResultManager'
import BaseResolver from './BaseResolver'

export default class DataSheetResolver extends BaseResolver {
  constructor (condition) {
    super()
    this.condition = condition
    this.datasheet = ResultManager.getDataSheet()
  }

  resolve () {
    if (!ResultStore.realResults) {
      return true
    }

    if (!this.isFilled()) { return false }
    if (this[this.condition.predicate]) {
      return this[this.condition.predicate](`${this.datasheet[this.condition.answer]}`, this.condition.value)
    }
    return true
  }

  isFilled () {
    const { condition } = this
    return condition.answer && condition.value
  }
}
