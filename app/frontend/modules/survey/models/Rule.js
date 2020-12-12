import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import LogicElement from './logic/LogicElement'

const Rule = function (attrs = {}, assessment) {
  this.assessment = assessment
  this.norm_id = attrs.norm_id
  this.norm_type = attrs.norm_type
  this.conditions = new LogicElement(attrs || {})
}

Rule.prototype = new EventEmitter()

_.extend(Rule.prototype, {

  remove () {
    _.remove(this.assessment.norm_rules, this)
  },

  toJSON () {
    return {
      norm_id: this.norm_id,
      norm_type: this.norm_type,
      conditions: this.conditions.toJSON().conditions,
    }
  },
})

export default Rule
