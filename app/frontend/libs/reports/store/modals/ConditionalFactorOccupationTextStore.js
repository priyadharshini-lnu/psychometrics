import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import CPIConditionCollection from 'rb/models/CPIConditionCollection'
import ResultStore from 'rb/store/ResultStore'
import I18nStore from 'rb/store/I18nStore'

const ConditionalFactorOccupationTextStore = function () {
  this.opened = false
}

ConditionalFactorOccupationTextStore.prototype = new EventEmitter()

_.extend(ConditionalFactorOccupationTextStore.prototype, {

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
      { id: max.id + 1, styles: {}, conditions: [{ type: 'Scoring' }] }, this.module,
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

  getText (module) {
    this.module = module
    if (this.module.props.basedOn === 'factor') {
      return this.fetchFactorText()
    }

    return this.fieldText(this.fetchOccupation())
  },

  fetchFactor () {
    return ResultStore.results[this.module.assessment_id].getTopFactorByRank(this.module.props.topPosition)
  },

  fetchOccupation () {
    return ResultStore.results[this.module.assessment_id].getOccupationByRank(this.module.props.topPosition)
  },

  fieldText (factorOrOccupation) {
    if (!factorOrOccupation) { return null }
    if (this.module.props.basedOn === 'factor') {
      return I18nStore.tFactor(factorOrOccupation, this.module.props.fieldName)
    }
    return I18nStore.tOccupation(factorOrOccupation, this.module.props.fieldName)
  },

  fetchFactorText () {
    const factor = this.fetchFactor()
    if (!factor) { return null }
    const conditions = _.filter(this.module.textConditions, { factorId: factor.id })
    let conditionText = null
    for (let i = 0; i < conditions.length; i += 1) {
      conditionText = _.invoke(
        conditions[i], 'getTextByCondition', factor.meanNormScore,
        _.indexOf(this.module.textConditions, conditions[i]),
      )
      if (conditionText) { break }
    }
    return conditionText || this.fieldText(factor)
  },

  fetchStyles (module) {
    this.module = module
    const factor = this.fetchFactor()
    if (!factor) { return {} }
    const conditions = _.filter(this.module.textConditions, { factorId: factor.id })
    let styles = {}
    for (let i = 0; i < conditions.length; i += 1) {
      styles = _.invoke(conditions[i], 'getStylesByCondition', factor.meanNormScore)
      if (styles) { break }
    }
    return styles
  },

  removeCollection (collection) {
    this.module.removeConditionCollection(collection)
    this.update()
  },
})

export default new ConditionalFactorOccupationTextStore()
