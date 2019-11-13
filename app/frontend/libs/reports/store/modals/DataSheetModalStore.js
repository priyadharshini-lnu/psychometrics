import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import AppStore from 'rb/store/AppStore'
import { setIn } from 'rb/utils/immutable'

const DataSheetModalStore = function () {
  this.opened = false
}

DataSheetModalStore.prototype = new EventEmitter()

_.extend(DataSheetModalStore.prototype, {
  update () {
    this.emit('change')
  },

  open () {
    this.opened = true
    this.columns = _.cloneDeep(AppStore.report.dataSheetColumns)
    this.update()
  },

  save () {
    AppStore.report.dataSheetColumns = this.columns
    this.close()
  },

  add (column) {
    this.columns = this.columns.concat(column)
    this.update()
  },

  updateColumn (path, value) {
    this.columns = setIn(this.columns, path, value)
    this.update()
  },

  close () {
    this.opened = false
    this.update()
  },

  updateColumns (columns) {
    this.columns = columns
    this.update()
  },

  remove (column) {
    this.columns = this.columns.filter(col => col.name !== column.name)
    this.update()
  },
})

export default new DataSheetModalStore()
