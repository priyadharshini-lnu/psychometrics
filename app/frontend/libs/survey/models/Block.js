import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import BlockListDispatcher from 'dispatchers/BlockListDispatcher'
import QuestionList from 'store/QuestionList'

let count = 1

const Block = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name || `Block${count}`
  this.position = attrs.position
  this.saveAsTemplate = false
  this.templateId = attrs.template_id
  this.deletedAt = attrs.deleted_at
  if (_.isEmpty(attrs.props)) {
    this.props = { randomization: { type: 'No' }, buttons: { prev_button: 'Previous', next_button: 'Next' } }
  } else {
    this.props = attrs.props
  }
  this.questions = new QuestionList(this, attrs.questions || [])
  count += 1
}

Block.prototype = new EventEmitter()

_.extend(Block.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      props: this.props,
      template_id: this.templateId,
      save_as_template: this.saveAsTemplate,
      deleted_at: this.deletedAt,
    }
  },

  isTemplate () {
    return this.templateId || this.saveAsTemplate
  },

  rename (name) {
    this.name = name
  },

  // TODO: Check and remove if not used
  moveDown () {
    this.position += 1
  },

  // TODO: Check and remove if not used
  moveUp () {
    this.position -= 1
  },

  restore () {
    BlockListDispatcher.clickRestore(this)
  },

  addQuestion (data) {
    this.questions.create(data)
  },

  addPageBreak () {
    this.questions.createPageBreak()
  },

  update () {
    this.sync()
  },

  // TODO: Check and remove if not used
  sync () {
  },

  createQuestionByTemplate (templateId) {
    this.questions.createByTemplate(templateId)
  },
})

export default Block
