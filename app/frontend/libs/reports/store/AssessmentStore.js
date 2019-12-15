import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Question from 'rb/models/Question'

const FILTER_QUESTION_TYPES = [
  'PageBreak',
  'StaticContent',
  'MetaInfo',
  'Captcha',
]

const AssessmentStore = function () {
  this.questions = {}
  this.embeddedData = {}
}

AssessmentStore.prototype = new EventEmitter()

_.extend(AssessmentStore.prototype, {
  init (data) {
    _.each(data, (assessment) => {
      this.embeddedData[assessment.id] = []
      this.questions[assessment.id] = {}
    })
    this.loadQuestions(data)
    this.loadEmbeddedData(data)
  },

  loadQuestions (data) {
    _.each(data, (assessment) => {
      _.map(_.flatten(assessment.blocks.map(block => block.questions)), (q) => {
        if (!q.deleted && _.indexOf(FILTER_QUESTION_TYPES, q.type) === -1) {
          this.questions[assessment.id][q.id] = new Question(q)
        }
      })
    })
  },

  loadEmbeddedData (data) {
    let embeddedData = []
    const parse = (elements) => {
      _.each(elements, (element) => {
        if (element.type === 'EmbeddedData') {
          _.map(element.props.storage, (el) => {
            embeddedData.push({ name: el.key, value: el.key, label: el.key })
          })
        }
        if (element.elements.length > 0) {
          parse(element.elements)
        }
      })
    }

    _.each(data, (assessment) => {
      embeddedData = []
      parse(assessment.flow ? assessment.flow.elements : [])
      this.embeddedData[assessment.id] = embeddedData
    })
  },
})

export default new AssessmentStore()
