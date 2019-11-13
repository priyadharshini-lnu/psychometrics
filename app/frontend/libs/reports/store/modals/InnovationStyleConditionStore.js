import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import InnovationStyleConditionCollection from 'rb/models/InnovationStyleConditionCollection'

const InnovationStyleConditionStore = function () {
  this.opened = false
}

InnovationStyleConditionStore.prototype = new EventEmitter()

_.extend(InnovationStyleConditionStore.prototype, {

  update () {
    this.emit('change')
  },

  open (module) {
    this.opened = true
    this.module = module
    this.old = _.cloneDeep(this.module.textConditions)
    this.update()
  },

  addCollection () {
    const max = _.maxBy(this.module.textConditions, 'id') || { id: 0 }
    this.module.addConditionCollection(new InnovationStyleConditionCollection(
      { id: max.id + 1, conditions: [{ type: 'Scoring' }] }, this.module,
    ))
    this.update()
  },

  save () {
    this.module.sync()
    this.opened = false
    this.update()
  },

  close () {
    this.opened = false
    this.module.textConditions = this.old
    this.module = false
    this.update()
  },

  removeCollection (collection) {
    this.module.removeConditionCollection(collection)
    this.update()
  },
})

export default new InnovationStyleConditionStore()
