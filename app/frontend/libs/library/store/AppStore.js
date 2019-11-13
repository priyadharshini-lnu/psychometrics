import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const AppStore = function () {
  this.loaded = false
  this.disabled = false
}

AppStore.prototype = new EventEmitter()

_.extend(AppStore.prototype, {
  init () {
    if (this.loaded) { return }
    this.disabled = false
    this.loaded = true
    this.emit('change')
  },

  disable () {
    this.disabled = true
    this.emit('change')
  },

  enable () {
    this.disabled = false
    this.emit('change')
  },

  update () {
    this.emit('change')
  },
})

export default new AppStore()
