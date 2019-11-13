import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Module from 'rb/models/Module'
import PageList from 'rb/store/PageList'

const ModulesStore = function (data, page, completedAssessments) {
  this.page = page
  this.list = []
  this.load(data, completedAssessments)
}

ModulesStore.prototype = new EventEmitter()

_.extend(ModulesStore.prototype, {
  addModule (type) {
    const module = new Module({ type }, this)
    const last = this.list[this.list.length - 1]
    if (last) {
      module.props.position.top = Math.min(last.props.position.top + last.props.position.height, 1100 - 200)
      module.props.position.left = last.props.position.left
    }
    if (last && last.props.position.top === module.props.position.top) {
      module.props.position.top = 120
      module.props.position.left += 20
    }
    this.create(module)
    return module
  },

  create (module) {
    this.list.push(module)
    this.update()
  },

  clone (module, offset) {
    const data = JSON.parse(JSON.stringify(module))
    data.id = null
    const cloneModule = new Module(data, this)
    if (offset !== false) {
      cloneModule.props.position.top += 20
      cloneModule.props.position.left += 20
    }
    this.create(cloneModule)
  },

  removeAll (items) {
    _.each(items, (item) => {
      this.remove(item)
    })
  },

  empty () {
    _.each(this.list, (item) => {
      this.remove(item)
    })
  },

  add (module) {
    this.list.push(module)
    this.update()
  },

  remove (module) {
    module.removed = true
    this.update()
  },

  load (data, completedAssessments) {
    this.list = []
    _.each(data, (module) => {
      if (completedAssessments.includes(module.assessment_id)) {
        const mod = new Module(module, this)
        this.list.push(mod)
        if (mod.props.showOnAllPages) {
          PageList.showOnAllPages.add(mod)
        }
      }
    })
    this.emit('change')
  },

  update () {
    this.emit('change')
  },
})

export default ModulesStore
