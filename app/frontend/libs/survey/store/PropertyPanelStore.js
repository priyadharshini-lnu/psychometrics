import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import store from '../rstore'

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
    store.dispatch({ type: 'survey/assessment/FAKE_UPDATE' }) // NOTE: @fedor hack to update ui remove it later
  },
})

export default new PropertyPanel()
