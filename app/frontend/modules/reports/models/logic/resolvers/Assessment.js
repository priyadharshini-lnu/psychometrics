import ResultStore from 'modules/reports/store/ResultStore'
import ResultManager from './ResultManager'
import BaseResolver from './BaseResolver'

export default class AssessmentResolver extends BaseResolver {
  constructor (condition) {
    super()
    this.condition = condition
    this.assessments = ResultManager.getAssessments()
    this.results = ResultStore.results
  }

  resolve () {
    if (!ResultStore.realResults) {
      return true
    }

    if (!this.isFilled()) { return false }
    return this[this.condition.answer]()
  }

  isFilled () {
    const { condition } = this
    return condition.subject && condition.answer
  }

  Completed () {
    const id = +this.condition.subject
    const assessment = _.find(this.assessments, { id })
    if (!assessment) { return false }

    return _.every(this.results[id].rawResults[id], ({ status }) => status === 'completed')
  }

  NotCompleted () {
    return !this.Completed()
  }

  ResultAvailable () {
    const id = +this.condition.subject
    const assessment = _.find(this.assessments, { id })
    if (!assessment) { return false }

    return _.some(this.results[id])
  }
}
