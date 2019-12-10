import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

let count = 1

const Block = function (attrs = {}) {
  if (attrs.id) {
    this.id = attrs.id
  } else {
    this.id = Date.now() + count
    this.isNew = true
  }
  this.name = attrs.name || `Block${count}`
  this.position = attrs.position
  this.deleted = attrs.deleted || false
  this.saveAsTemplate = false
  this.templateId = attrs.template_id
  this.deletedAt = attrs.deleted_at
  if (_.isEmpty(attrs.props)) {
    this.props = { randomization: { type: 'No' }, buttons: { prev_button: 'Previous', next_button: 'Next' } }
  } else {
    this.props = attrs.props
  }
  this.questions = attrs.questions || []
  count += 1
}

Block.prototype = new EventEmitter()

_.extend(Block.prototype, {
  toJSON () {
    return {
      id: this.isNew ? undefined : this.id,
      name: this.name,
      position: this.position,
      props: this.props,
      template_id: this.templateId,
      save_as_template: this.saveAsTemplate,
      deleted_at: this.deletedAt,
      questions: this.questions,
    }
  },

  createQuestionByTemplate (templateId) {
    this.questions.createByTemplate(templateId)
  },
})

export default Block
