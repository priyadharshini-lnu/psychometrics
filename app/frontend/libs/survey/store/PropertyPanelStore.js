import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import store from './index'

const PropertyPanel = function () {}

PropertyPanel.prototype = new EventEmitter()

_.extend(PropertyPanel.prototype, {
  update () {
    this.emit('change')
    store.dispatch({ type: 'survey/assessment/FAKE_UPDATE' }) // NOTE: @fedor hack to update ui remove it later
  },
})

export default new PropertyPanel()
