import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import AppStore from 'rb/store/AppStore'

const FilterStore = function () {
  this.opened = false
}

FilterStore.prototype = new EventEmitter()

_.extend(FilterStore.prototype, {

  update () {
    this.emit('change')
  },

  open () {
    this.opened = true
    this.old = _.cloneDeep(AppStore.report.filters)
    this.update()
  },

  addFilter () {
    AppStore.report.addFilter({ conditions: [{ type: 'RelationShip' }] })
    this.update()
  },

  save () {
    AppStore.report.syncFilters(() => {
      this.opened = false
      this.update()
    })
  },

  close () {
    this.opened = false
    AppStore.report.filters = this.old
    this.update()
  },

  removeFilter (rule) {
    AppStore.report.removeFilter(rule)
    this.update()
  },
})

export default new FilterStore()
