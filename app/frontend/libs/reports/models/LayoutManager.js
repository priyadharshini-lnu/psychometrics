import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import PageList from 'rb/store/PageList'

const TOP = 5000
const BOTTOM = 2000

const LayoutManager = function (page) {
  this.page = page
  this.size = page.size
  this.last = 3000
}

LayoutManager.prototype = new EventEmitter()

_.extend(LayoutManager.prototype, {
  updateModule (module) {
    this.last += 1
    module.props.zIndex = this.last
  },

  alignTop (module) {
    module.props.position.top = 0
    module.update()
  },

  alignBottom (module) {
    module.props.position.top = this.size.height - module.props.position.height
    module.update()
  },

  alignLeft (module) {
    module.props.position.left = 0
    module.update()
  },

  alignRight (module) {
    module.props.position.left = this.size.width - module.props.position.width
    module.update()
  },

  alignMiddleVertical (module) {
    module.props.position.top = Math.floor((this.size.height - module.props.position.height) / 2)
    module.update()
  },

  alignMiddleHorizontal (module) {
    module.props.position.left = Math.floor((this.size.width - module.props.position.width) / 2)
    module.update()
  },

  alwaysOnTop (module) {
    if (module.props.onTop) {
      module.props.onTop = false
      this.updateModule(module)
    } else {
      module.props.onBottom = false
      module.props.onTop = true
      module.props.zIndex = TOP
    }
    module.update()
  },

  alwaysOnBottom (module) {
    if (module.props.onBottom) {
      module.props.onBottom = false
      this.updateModule(module)
    } else {
      module.props.onBottom = true
      module.props.onTop = false
      module.props.zIndex = BOTTOM
    }
    module.update()
  },

  moveInFront (module) {
    module.props.zIndex += 1
    module.update()
  },

  moveInBack (module) {
    module.props.zIndex -= 1
    module.update()
  },

  showOnAllPages (module) {
    module.props.showOnAllPages = !module.props.showOnAllPages
    if (module.props.showOnAllPages) {
      PageList.showOnAllPages.add(module)
    } else {
      PageList.showOnAllPages.remove(module)
    }
    module.update()
    PageList.update()
  },

  update () {
    this.page.modules.update()
  },
})

export default LayoutManager
