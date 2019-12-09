/* eslint-disable no-param-reassign */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Question from 'models/Question'
import QuestionListDispatcher from 'dispatchers/QuestionListDispatcher'
import Socket from 'cable'
import Action from 'undo'
import PropertyPanelStore from './PropertyPanelStore'

const QuestionList = function (block, questions) {
  this.block = block
  this.dispatcher = new QuestionListDispatcher(this)
  this.list = []
  if (questions.length) {
    this.load(questions)
  }
}

QuestionList.prototype = new EventEmitter()

_.extend(QuestionList.prototype, {

  createPageBreak (data = {}) {
    const newData = { ...data }
    newData.position = this.list.length
    newData.type = 'PageBreak'
    const question = new Question(newData, this)
    this.list.push(question)
    Action('QuestionCreate', this, question)
    this.emit('change')
    return question
  },

  restore (question) {
    const last = _.last(this.list)
    question.position = last ? last.position + 1 : 1
    question.deletedAt = null
    this.list.push(question)
    this.emit('change')
    return question
  },

  insertPageBreak (model) {
    const position = _.findIndex(this.list, model)
    const newPageBreak = new Question({ name: 'PB', type: 'PageBreak', position }, this)
    this.moveAllAndPush(position + 1, newPageBreak)
  },

  moveAllAndPush (i, obj) {
    _.each(_.slice(this.list, i), (q) => { q.position += 1 })
    this.list.push(obj)
    this.sort()
  },

  sort () {
    this.list = _.sortBy(this.list, ['position'])
    _.each(this.list, (question, position) => {
      question.position = position + 1
    })
    this.emit('change')
  },

  clone (question) {
    const position = _.findIndex(this.list, question)
    const newQuestionParams = _.extend(question.toJSON(), { id: null, position })
    const newQuestion = new Question(newQuestionParams, this)
    Action('QuestionCreate', this, newQuestion)
    this.moveAllAndPush(position + 1, newQuestion)
    PropertyPanelStore.select(newQuestion)
  },

  saveAsTemplate (question) {
    question.saveAsTemplate = true
    this.update()
  },

  unlinkTemplate (question) {
    question.templateId = null
    question.saveAsTemplate = false
    this.update()
  },

  createByTemplate (templateId) {
    Socket.socket().perform('question_create_by_template', {
      block_id: this.block.id,
      template_id: templateId,
    }, (templateData) => {
      const question = new Question(templateData, this)
      this.list.push(question)
      this.update()
    })
  },

  update () {
    this.emit('change')
  },
})

export default QuestionList
