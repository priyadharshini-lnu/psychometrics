import _ from 'lodash'
import store from 'rb/store/PageList'

const Dispatcher = function () {}

_.extend(Dispatcher.prototype, {

  addPage () {
    store.addPage()
  },

  addPageAfter (page) {
    store.addPageAfter(page)
  },

})

export default new Dispatcher()
