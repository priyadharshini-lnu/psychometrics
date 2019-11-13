import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const HotSpotStore = function () {
  this.shapeIndex = null
}

HotSpotStore.prototype = new EventEmitter()

_.extend(HotSpotStore.prototype, {
  select (shapeIndex) {
    this.shapeIndex = shapeIndex
    this.update()
  },

  unselect () {
    this.shapeIndex = null
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new HotSpotStore()
