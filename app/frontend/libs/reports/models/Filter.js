import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Socket from 'rb/cable'
import FilterCondition from './FilterCondition'

const Filter = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name
  this.assessmentId = attrs.assessment_id
  this.conditions = []
  if (attrs.conditions) {
    _.each(attrs.conditions, (condition) => {
      this.addCondition(condition)
    })
  }
}

Filter.prototype = new EventEmitter()

_.extend(Filter.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      conditions: this.conditions,
      assessment_id: this.assessmentId,
    }
  },

  rename (val) {
    this.name = val
    this.sync()
  },

  addCondition (attrs) {
    this.conditions.push(new FilterCondition(attrs, this))
  },

  sync () {
    Socket.socket().perform('report_update', this)
  },

  /**
   * Return true, if results are included in filter
   */
  correctByFilter (userResult) {
    if (this.conditions && this.conditions[0] && this.conditions[0].type) {
      const cond = this.conditions[0]
      switch (cond.type) {
        case 'RelationShip':
          if (cond.props.predicate && cond.props.value) {
            switch (cond.props.predicate) {
              case 'IsNot':
                return userResult.relationship !== cond.props.value
              case 'Is':
                return userResult.relationship === cond.props.value
              default:
                throw new Error(`predicate ${cond.props.predicate} is not supported`)
            }
          }
          break
        default:
          throw new Error(`type ${this.conditions[0].type} is not supported for filtering`)
      }
    }
    return false
  },
})

export default Filter
