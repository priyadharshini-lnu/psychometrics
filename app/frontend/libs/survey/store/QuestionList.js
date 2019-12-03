/* eslint-disable no-param-reassign */
import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Question from 'models/Question'
import QuestionListDispatcher from 'dispatchers/QuestionListDispatcher'
import TrashStore from 'store/TrashStore'
import Socket from 'cable'
import Action from 'undo'
import PropertyPanelStore from './PropertyPanelStore'
import BlockList from './BlockList'

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

  // load (questions) {
  //   this.list = []
  //   _.each(questions, (question) => {
  //     if (!question.deleted) {
  //       this.list.push(new Question(question, this))
  //     } else if (!this.block.deleted) {
  //       TrashStore.add('Question', new Question(question, this))
  //     }
  //   })
  //   this.emit('change')
  // },

  // create (data = {}) {
  //   const last = (_.last(this.list) || {}).position
  //   const question = new Question(data, this)

  //   question.position = (typeof last !== 'undefined') ? last + 1 : 1
  //   this.list.push(question)
  //   Action('QuestionCreate', this, question)
  //   this.emit('change')
  // },

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

  // destroy (model) {
  //   const question = _.find(this.list, model)
  //   _.remove(this.list, question)
  //   // TrashStore.add('Question', question)
  //   this.emit('change')
  // },

  moveDown (model) {
    const index = _.findIndex(this.list, model)
    if (index !== this.list.length - 1) {
      const upPos = this.list[index].position
      const downPos = this.list[index + 1].position
      this.list[index].moveDown(downPos)
      this.list[index + 1].position = upPos
      this.sort()
      return true
    }

    const blockIndex = _.findIndex(BlockList.list, this.block)
    const newBlock = BlockList.list[blockIndex + 1]
    const newPosition = 1
    if (newBlock) {
      this.reattachToBlock(newBlock, model, newPosition)
      return true
    }
    return false
  },

  moveUp (model) {
    const index = _.findIndex(this.list, model)
    if (index !== 0) {
      const downPos = this.list[index].position
      const upPos = this.list[index - 1].position
      this.list[index].moveUp(upPos)
      this.list[index - 1].position = downPos
      this.sort()
      return true
    }
    const blockIndex = _.findIndex(BlockList.list, this.block)
    const newBlock = BlockList.list[blockIndex - 1]
    if (newBlock) {
      const newPosition = newBlock.questions.list.length ? _.maxBy(newBlock.questions.list, 'position') + 1 : 0
      this.reattachToBlock(newBlock, model, newPosition)
      return true
    }
    return false
  },

  reattachToBlock (block, question, position) {
    question.position = position
    question.block = block
    block.questions.moveAllAndPush(position - 1, question)
    this.destroy(question)
    this.sort()
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

  // insertAfter (model) {
  //   const index = _.findIndex(this.list, model)
  //   const position = this.list[index].position + 1
  //   const question = new Question({ position }, this)

  //   this.moveAllAndPush(index + 1, question)
  //   Action('QuestionCreate', this, question)
  // },

  // insertBefore (model) {
  //   const index = _.findIndex(this.list, model)
  //   const { position } = this.list[index]
  //   const question = new Question({ position }, this)

  //   this.moveAllAndPush(index, question)
  //   Action('QuestionCreate', this, question)
  // },

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
