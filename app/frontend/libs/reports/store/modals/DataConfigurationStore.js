import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import AppStore from 'rb/store/AppStore'

const DataConfigurationStore = function () {
  this.opened = false
  this.dataConfiguration = ''
}

DataConfigurationStore.prototype = new EventEmitter()

_.extend(DataConfigurationStore.prototype, {

  // Sets data configuration received from server
  setDataConfiguration (dataConfiguration) {
    this.dataConfiguration = _.cloneDeep(dataConfiguration)
  },

  // Emits changes
  update () {
    this.emit('change')
  },

  // Opens pop up window
  open () {
    this.opened = true
    this.old = _.cloneDeep(this.dataConfiguration)
    this.update()
  },

  // Closes pop up
  close () {
    this.opened = false
    this.dataConfiguration = this.old
    this.update()
  },

  // Syncs changes with server and closes pop up
  save () {
    AppStore.report.syncDataConfiguration(() => {
      this.opened = false
      this.update()
    })
  },
})

export default new DataConfigurationStore()
