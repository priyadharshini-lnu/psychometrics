import ResultStore from 'rb/store/ResultStore'

class BaseType {
  constructor (condition, assessmentId) {
    this.condition = condition
    this.filterScope = condition.props.filterScope
    this.assessmentId = assessmentId
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
