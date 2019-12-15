import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import HeaderStore from 'rb/store/HeaderStore'

const PropertyPanel = function () {
  this.type = 'Report'
}

PropertyPanel.prototype = new EventEmitter()

_.extend(PropertyPanel.prototype, {
  select (type, model) {
    this.type = type
    this.model = model
    this.offset = HeaderStore.offset
    this.popupOpen = false
    this.update()
  },

  unselect () {
    this.type = 'Report'
    this.model = null
    this.update()
  },

  popupOpened () {
    this.popupOpen = true
    this.update()
  },

  popupClosed () {
    this.popupOpen = false
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new PropertyPanel()
