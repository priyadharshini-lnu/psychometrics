import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Factor from 'models/Factor'
import Scoring from 'models/Scoring'

const FactorList = function () {
  this.list = []
  this.currentFactor = null
  this.scoring = {}
}

FactorList.prototype = new EventEmitter()

_.extend(FactorList.prototype, {
  load (data) {
    this.list = []
    _.each(data, (factor) => {
      this.list.push(new Factor(factor))
    })
    if (this.currentFactor) {
      this.reloadScoring()
    }
    this.setFirstFactor()
    this.emit('change')
  },

  // This function help add new scoring from Scoring Form
  addScoring (attrs = {}) {
    const newScoring = new Scoring(attrs, this.currentFactor)
    this.currentFactor.scoring.list.push(newScoring)
    this.scoring[attrs.question_id] = newScoring
    return newScoring
  },

  setFirstFactor () {
    if (this.list.length) {
      this.changeFactor(this.list[0])
    }
  },

  changeFactor (factor) {
    this.currentFactor = factor
    this.reloadScoring()
    this.emit('change')
  },

  reloadScoring () {
    this.scoring = {}
    _.each(this.currentFactor.scoring.list, (item) => {
      this.scoring[item.question_id] = item
    })
    this.saveCurrentFactorToFactorsList()
  },

  saveCurrentFactorToFactorsList () {
    const factorIndex = _.findIndex(this.list, { id: this.currentFactor.id })
    this.list[factorIndex] = this.currentFactor
  },

  getCurrentFactorName () {
    if (this.currentFactor) {
      return this.currentFactor.getName()
    }
    return 'Choose Factor'
  },
})

export default new FactorList()
