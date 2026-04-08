import ResultStore from '~/modules/reports/store/ResultStore'
import { GRAPH_CONDITION_TYPES } from '~/modules/reports/consts/Report'

class BaseType {
  constructor (condition, assessmentId) {
    this.condition = condition
    this.filterScope = condition.props.filterScope
    this.assessmentId = condition.assessmentId || assessmentId
    this.skipRoundingValues = condition.collection.module.props.skipRoundingValues
    this.textConditionType = condition.collection.module.props.textConditionType || GRAPH_CONDITION_TYPES.DEFAULT
  }

  isFilled () {
    console.error('should be implemented')
  }

  isValid () {
    console.error('should be implemented')
  }

  getResults () {
    if (this.filterScope) {
      return ResultStore.results[this.assessmentId].getByFilter(this.filterScope)
    }
    return ResultStore.results[this.assessmentId]
  }
}

export default BaseType
