import _ from 'lodash'
import store from 'modules/reports/store/PropertyPanelStore'

const Dispatcher = function () {}

_.extend(Dispatcher.prototype, {
  select (question, offsetTop) {
    store.select(question, offsetTop)
  },

  unselect () {
    store.unselect()
  },
})

export default new Dispatcher()
