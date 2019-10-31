import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import CPIConditionCollection from 'rb/models/CPIConditionCollection'

const CPIFactorConditionStore = function () {
  this.opened = false
}

CPIFactorConditionStore.prototype = new EventEmitter()

_.extend(CPIFactorConditionStore.prototype, {

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
    this.module.addConditionCollection(new CPIConditionCollection(
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

export default new CPIFactorConditionStore()
