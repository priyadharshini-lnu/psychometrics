import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Block from 'models/Block'
import Socket from 'cable'
import Action from 'undo'

const BlockList = function () {
  this.list = []
}

BlockList.prototype = new EventEmitter()

_.extend(BlockList.prototype, {
  createDefault () {
    const block = new Block({ name: 'Default Block', position: 0 })
    this.list.push(block)
    this.emit('change')
  },

  restore (block) {
    const last = _.last(this.list)
    block.position = last ? last.position + 1 : 0
    block.deletedAt = null
    this.list.push(block)
    this.emit('change')
    return block
  },

  destroy (model) {
    const block = _.find(this.list, model)
    _.remove(this.list, block)
    // TrashStore.add('Block', question)
    if (!this.list.length) {
      this.createDefault()
    }
    this.sort()
    this.emit('change')
  },

  moveDown (model) {
    const index = _.findIndex(this.list, model)
    if (index !== this.list.length - 1) {
      const oldPosition = this.list[index].position
      const newPosition = this.list[index + 1].position
      this.list[index].position = newPosition
      this.list[index + 1].position = oldPosition
      this.sort()
      this.emit('change')
      return true
    }
    return false
  },

  moveUp (model) {
    const index = _.findIndex(this.list, model)
    if (index !== 0) {
      const oldPosition = this.list[index].position
      const newPosition = this.list[index - 1].position
      this.list[index].position = newPosition
      this.list[index - 1].position = oldPosition
      this.sort()
      this.emit('change')
      return true
    }
    return false
  },

  moveAllAndPush (i, obj) {
    if (i || i === 0) {
      _.each(_.slice(this.list, i), (b) => { b.position += 1 })
    }
    this.list.push(obj)
    this.sort()
  },

  sort () {
    this.list = _.sortBy(this.list, ['position'])
    _.each(this.list, (block, position) => {
      block.position = position + 1
    })
    this.update()
  },

  clone (model, name) {
    const index = _.findIndex(this.list, model)
    const position = model ? model.position + 1 : 0
    // Init new block params
    const newBlockParams = {
      name, position, props: model.props, questions: [],
    }

    _.each(model.questions.list, (question) => {
      const newQuestrionParams = _.extend(question.toJSON(), { id: null })
      newBlockParams.questions.push(newQuestrionParams)
    })

    const newBlock = new Block(newBlockParams)
    this.moveAllAndPush(index + 1, newBlock)
    Action('BlockCreate', this, newBlock)
  },

  update () {
    this.emit('change')
  },

  createBlockByTemplate (templateId, positionBefore) {
    Socket.socket().perform('block_create_by_template', {
      template_id: templateId,
      position_before: positionBefore,
    }, (templateData) => {
      const block = new Block(templateData)
      this.moveAllAndPush(positionBefore, block)
      this.update()
    })
  },

  saveAsTemplate (block) {
    block.saveAsTemplate = true
    this.update()
  },

  unlinkTemplate (block) {
    block.templateId = null
    block.saveAsTemplate = false
    this.update()
  },
})

export default new BlockList()
