import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const PropertyPanel = function () {
  this.question = null
}

PropertyPanel.prototype = new EventEmitter()

_.extend(PropertyPanel.prototype, {
  select (question, offsetTop) {
    this.question = question
    this.offset = offsetTop
    this.update()
  },

  unselect () {
    this.question = null
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new PropertyPanel()
