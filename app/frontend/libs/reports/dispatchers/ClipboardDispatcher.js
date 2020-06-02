import _ from 'lodash'
import pageListStore from 'rb/store/PageList'
import appStore from 'rb/store/AppStore'

const VERTICAL_SPACE_BETWEEN_PAGES = 95

const Dispatcher = function () {
  this.buffer = []
}

_.extend(Dispatcher.prototype, {
  copy () {
    this.buffer = pageListStore.selected
  },

  paste (offsetTop) {
    const current = Math.round(offsetTop / (appStore.report.props.sizes.height + VERTICAL_SPACE_BETWEEN_PAGES))
    const page = pageListStore.list[current]
    _.each(this.buffer, (module) => {
      page.modules.clone(module, true)
    })
  },
})

export default new Dispatcher()
