import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Block from 'models/Block'
import Socket from 'cable'

const BlockList = function () {
  this.list = []
}

BlockList.prototype = new EventEmitter()

_.extend(BlockList.prototype, {
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

})

export default new BlockList()
