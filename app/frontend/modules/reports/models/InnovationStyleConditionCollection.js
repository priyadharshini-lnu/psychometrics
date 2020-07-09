import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import I18nStore from 'rb/store/I18nStore'
import InnovationStyleCondition from './InnovationStyleCondition'

const InnovationStyleConditionCollection = function (attrs = {}, module) {
  this.id = attrs.id
  this.strengths = attrs.strengths
  this.blindspots = attrs.blindspots
  this.module = module
  this.innovationStyleId = attrs.innovationStyleId
  this.conditions = []
  if (attrs.conditions) {
    _.each(attrs.conditions, (condition) => {
      this.addCondition(condition)
    })
  }
}

InnovationStyleConditionCollection.prototype = new EventEmitter()

_.extend(InnovationStyleConditionCollection.prototype, {
  toJSON () {
    return {
      id: this.id,
      strengths: this.strengths,
      blindspots: this.blindspots,
      innovationStyleId: this.innovationStyleId,
      conditions: this.conditions,
    }
  },

  rename (val) {
    this.name = val
    this.sync()
  },

  addCondition (attrs) {
    this.conditions.push(new InnovationStyleCondition(attrs, this))
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
})

export default InnovationStyleConditionCollection
