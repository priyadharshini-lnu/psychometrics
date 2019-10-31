import _ from 'lodash'
import store from 'rb/store/AssessmentStore'
import ResultStore from 'rb/store/ResultStore'
import ResultManager from './ResultManager'
import BaseResolver from './BaseResolver'
import QuestionTypesAnswers from './QuestionTypesAnswers'

export default class QuestionResolver extends BaseResolver {
  constructor (condition) {
    super()
    this.condition = condition
    this.results = ResultManager.getResultsByFilter(condition.filterId)
  }

  resolve () {
    if (!ResultStore.realResults) {
      return true
    }

    if (!this.isFilled()) { return false }
    if (this[this.condition.type]) {
      const typeValue = this[this.condition.type]()
      return this[this.condition.predicate](typeValue, +this.condition.value)
    }
    return true
  }

  isFilled () {
    const { condition } = this
    return condition.subject && condition.answer && condition.type && condition.predicate && condition.value
  }

  getAnswers () {
    const assessment = ResultManager.getAssessmentByFilter(this.condition.filterId)
    const question = store.questions[assessment.id][this.condition.subject]
    const qResults = this.results.questions[this.condition.subject]
    return QuestionTypesAnswers[question.type](qResults[0], this.condition.answer)
  }

  Mean () {
    const answers = this.getAnswers()
    const sum = _.sumBy(answers, 'value')
    return sum / answers.length
  }

  RespondentsCount () {
    const answers = this.getAnswers()
    return answers.length
  }

  Sum () {
    const answers = this.getAnswers()
    return _.sumBy(answers, 'value')
  }

  Minimum () {
    const answers = this.getAnswers()
    const min = _.minBy(answers, 'value')
    return min && min.value
  }

  Maximum () {
    const answers = this.getAnswers()
    const max = _.maxBy(answers, 'value')
    return max && max.value
  }
}
