import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import I18nStore from 'rb/store/I18nStore'
import CPICondition from './CPICondition'

const CPIConditionCollection = function (attrs = {}, module) {
  this.id = attrs.id
  this.text = attrs.text
  this.strengths = attrs.strengths
  this.blindspots = attrs.blindspots
  this.workstyles = attrs.workstyles
  this.possibleRoles = attrs.possibleRoles
  this.color = attrs.color
  this.module = module
  this.factorId = attrs.factorId
  this.styles = attrs.styles || {}
  this.conditions = []
  if (attrs.conditions) {
    _.each(attrs.conditions, (condition) => {
      this.addCondition(condition)
    })
  }
}

CPIConditionCollection.prototype = new EventEmitter()

_.extend(CPIConditionCollection.prototype, {
  toJSON () {
    return {
      id: this.id,
      text: this.text,
      strengths: this.strengths,
      blindspots: this.blindspots,
      workstyles: this.workstyles,
      possibleRoles: this.possibleRoles,
      color: this.color,
      factorId: this.factorId,
      styles: this.styles,
      conditions: this.conditions,
    }
  },

  rename (val) {
    this.name = val
    this.sync()
  },

  addCondition (attrs) {
    this.conditions.push(new CPICondition(attrs, this))
  },

  sync () {
    this.model.sync()
  },

  getTextByCondition (score, index, type = 'text') {
    if (this.conditions.length === 0) {
      return null
    }
    let result = true
    _.each(this.conditions, (cond) => {
      result = result && cond.isValid(score)
    })
    return result
      ? I18nStore.tModule(
        this.module,
        `textConditions${_.capitalize(type)}${index + 1}`, { condition: index, type },
      ) : null
  },

  getColorByCondition (score) {
    if (this.conditions.length === 0) {
      return {}
    }
    let result = true
    _.each(this.conditions, (cond) => {
      result = result && cond.isValid(score)
    })
    return result ? this.color : {}
  },

  getStylesByCondition (score) {
    if (this.conditions.length === 0) {
      return {}
    }
    let result = true
    _.each(this.conditions, (cond) => {
      result = result && cond.isValid(score)
    })
    return result ? this.styles : {}
  },
})

export default CPIConditionCollection
