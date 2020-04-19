import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import ModulesStore from 'rb/store/ModulesStore'
import Utils from 'libs/reports/utils/Utils'
import LayoutManager from './LayoutManager'
import LogicElement from './logic/LogicElement'

const Page = function (attrs = {}, completedAssessments = []) {
  this.id = attrs.id
  this.isNew = attrs.isNew
  if (!this.id) {
    this.id = Utils.genId()
    this.isNew = true
  }
  this.name = attrs.name || 'Page'
  this.position = attrs.position
  this.props = attrs.props || {}
  this.visible = true
  this.renderModules = true
  this.removed = attrs.removed || false
  this.displayLogic = attrs.display_logic ? new LogicElement(attrs.display_logic) : null
  this.modules = new ModulesStore(attrs.modules, this, completedAssessments)
  this.layoutManager = new LayoutManager(this)
}

Page.prototype = new EventEmitter()

_.extend(Page.prototype, {
  toJSON () {
    return {
      id: typeof this.id === 'string' ? null : this.id,
      name: this.name,
      props: this.props,
      position: this.position,
      removed: this.removed,
      display_logic: this.displayLogic,
      modules: [],
      isNew: this.isNew,
    }
  },

  addModule (type) {
    const module = this.modules.addModule(type)
    this.layoutManager.updateModule(module)
    return module
  },

  sync () {
    // Socket.socket().perform('page_update', this)
  },
})

export default Page
