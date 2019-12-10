import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const BlockList = function () {
  this.list = []
}

BlockList.prototype = new EventEmitter()

_.extend(BlockList.prototype, {
})

export default new BlockList()
