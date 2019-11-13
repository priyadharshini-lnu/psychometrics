import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const DefaultValueStore = function () {
  this.model = null
}

DefaultValueStore.prototype = new EventEmitter()

_.extend(DefaultValueStore.prototype, {
  open (model) {
    this.model = model
    this.update()
  },

  close () {
    this.model = null
    this.callback = null
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new DefaultValueStore()
