import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Question from 'models/Preview/Question'
import { NOT_ANSWERED_QUESTIONS } from 'store/AssessmentPreviewStore'
import ValidationProcessor from './ValidationProcessor'

// eslint-disable-next-line func-names
const Page = function (attrs = {}, flowElement = null, results) {
  this.flowElement = flowElement
  this.end = attrs.end || false
  if (attrs.block && attrs.block.props) {
    this.block = attrs.block
    this.nextBtn = attrs.block.props.next_button
    this.prevBtn = attrs.block.props.prev_button
  }
  this.questions = _.map(this.getQuestions(attrs.questions), (question) => {
    let questionResults = {}
    if (results && results[question.id]) {
      questionResults = results[question.id]
    }
    return new Question(question, this, questionResults)
  })
  this.validations = new ValidationProcessor(this)
  this.skipLogic = attrs.skipLogic
  this.displayLogic = attrs.displayLogic
  this.errors = []
}

Page.prototype = new EventEmitter()

_.extend(Page.prototype, {
  validate () {
    this.errors = []

    _.each(this.questions, (question) => {
      const errors = question.validate()
      if (errors.length) {
        this.errors.push({ question, errors })
      }
    })
  },

  displayLogic () {

  },

  results () {
    return this.questions.map(q => q.result)
  },

  getQuestions (questions) {
    if (!this.block || !this.block.props) { return questions }
    const { randomization } = this.block.props
    if (!randomization || randomization.type === 'No') { return questions }

    if (randomization.type === 'All') { return _.shuffle(questions) }
    if (randomization.type === 'Some') { return _.take(_.shuffle(questions), randomization.questions) }

    return questions
  },

  countAnsweredQuestions () {
    const results = this.results()
    return results.filter(r => !NOT_ANSWERED_QUESTIONS.includes(r.question.type)).filter(r => !r.isEmpty()).length
  },

  resetAnswers () {
    this.questions.map(q => q.resetAnswers())
  },
})

export default Page
