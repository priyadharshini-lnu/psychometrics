import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const HeaderStore = function () {
  this.showCK = false
  this.offset = 0
}

HeaderStore.prototype = new EventEmitter()

_.extend(HeaderStore.prototype, {

  update () {
    this.emit('change')
  },
})

export default new HeaderStore()
