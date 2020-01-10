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

  copyPage (page) {
    this.pageBuffer = page
  },

  pastePage (page) {
    if (this.pageBuffer) {
      if (page.modules.list.length > 0) {
        // eslint-disable-next-line no-alert
        if (!confirm('Are u sure? This action will replace modules on page.')) {
          return
        }
      }
      page.modules.empty()
      _.each(this.pageBuffer.modules.list, (module) => {
        page.modules.clone(module, false)
      })
    } else {
      // eslint-disable-next-line no-alert
      alert('Nothing to paste')
    }
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
