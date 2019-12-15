import _ from 'lodash'
import pageListStore from 'rb/store/PageList'
import appStore from 'rb/store/AppStore'

const VERTICAL_SPACE_BETWEEN_PAGES = 95

const Dispatcher = function () {}

_.extend(Dispatcher.prototype, {

  addModule (type, offsetTop) {
    const page = Math.round(offsetTop / (appStore.report.props.sizes.height + VERTICAL_SPACE_BETWEEN_PAGES))
    pageListStore.addModule(page, type)
  },

  backspace () {
    pageListStore.removeAll()
  },

  updatePage (scrollTop) {
    const page = Math.round(scrollTop / (appStore.report.props.sizes.height + VERTICAL_SPACE_BETWEEN_PAGES))
    if (pageListStore.current === page) {
      return
    }

    pageListStore.current = page < pageListStore.list.length - 1 ? page : pageListStore.list.length - 1
    pageListStore.update()
  },

})

export default new Dispatcher()
