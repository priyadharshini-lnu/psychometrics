import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import AppStore from 'rb/store/AppStore'
import TextConditionCollection from 'rb/models/TextConditionCollection'

const ConditionTextStore = function () {
  this.opened = false
}

ConditionTextStore.prototype = new EventEmitter()

_.extend(ConditionTextStore.prototype, {

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
    const max = _.maxBy(AppStore.report.filters, 'id') || { id: 0 }
    this.module.addConditionCollection(new TextConditionCollection(
      { id: max.id + 1, conditions: [{ props: {} }] }, this.module,
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

export default new ConditionTextStore()
