import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import BlockList from './BlockList'

const CreateByTemplateStore = function () {
  this.model = null
  this.template = null
  this.entityName = null
  this.positionBefore = null
}

CreateByTemplateStore.prototype = new EventEmitter()

_.extend(CreateByTemplateStore.prototype, {
  openQuestionPopup (model, entityName) {
    this.model = model
    this.entityName = entityName
    this.update()
  },

  openBlockPopup (positionBefore, entityName) {
    this.positionBefore = positionBefore
    this.entityName = entityName
    this.update()
  },

  close () {
    this.model = null
    this.entityName = null
    this.template = null
    this.update()
  },

  createQuestion () {
    if (this.template) {
      this.model.createQuestionByTemplate(this.template.value)
      this.close()
    }
  },

  createBlock () {
    if (this.template) {
      BlockList.createBlockByTemplate(this.template.value, this.positionBefore)
      this.close()
    }
  },

  update () {
    this.emit('change')
  },

  setTemplate (template) {
    this.template = template
    this.update()
  },
})

export default new CreateByTemplateStore()
