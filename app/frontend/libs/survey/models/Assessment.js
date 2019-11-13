import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Flow from './Flow'
import Rule from './Rule'

const Assessment = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name
  this.norm_rules = []
  if (attrs.norm_rules) {
    _.each(attrs.norm_rules, (rule) => {
      this.addRule(rule)
    })
  }
  this.flow = new Flow(attrs.flow || {})
  this.enable_back = attrs.enable_back
  this.enable_progress = attrs.enable_progress
}

Assessment.prototype = new EventEmitter()

_.extend(Assessment.prototype, {
  addRule (attrs) {
    this.norm_rules.push(new Rule(attrs, this))
  },

  removeRule (rule) {
    _.remove(this.norm_rules, rule)
  },

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      flow: this.flow,
      norm_rules: this.norm_rules,
      enable_back: this.enable_back,
      enable_progress: this.enable_progress,
    }
  },

  sync () {
  },

  toggleEnableBack () {
    this.enable_back = !this.enable_back
  },

  toggleEnableProgress () {
    this.enable_progress = !this.enable_progress
  },
})

export default Assessment
