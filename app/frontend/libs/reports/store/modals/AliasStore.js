import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import AppStore from 'rb/store/AppStore'

const AliasStore = function () {
  this.opened = false
  this.savePopUp = false
}

AliasStore.prototype = new EventEmitter()

_.extend(AliasStore.prototype, {

  setFactors (originalFlatFactors) {
    this.flatFactors = _.cloneDeep(originalFlatFactors)
    this.updateStructuredFactors()
  },

  getFactors () {
    return this.flatFactors
  },

  update () {
    this.emit('change')
  },

  open () {
    this.opened = true
    this.old = _.cloneDeep(this.flatFactors)
    this.updateStructuredFactors()
    this.update()
  },

  save (callback) {
    AppStore.report.syncAliases(() => {
      callback()
    })
  },

  showSavePopUp () {
    this.savePopUp = true
    this.emit('savePopUpChange')
  },

  closeSavePopUp () {
    this.savePopUp = false
    this.emit('savePopUpChange')
  },

  close () {
    this.opened = false
    this.flatFactors = this.old
    this.update()
  },

  changeFactorsAlias (factorId, value) {
    const factor = _.find(this.flatFactors, ['id', factorId])
    factor.alias = value
  },

  updateStructuredFactors () {
    this.structuredFactors = _.cloneDeep(this.flatFactors)
  },
})

export default new AliasStore()
