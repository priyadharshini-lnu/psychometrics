import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const OccupationsFactor = function (attrs = {}) {
  this.id = attrs.id
  this.predicate = attrs.predicate
  this.value = attrs.value
  this.position = attrs.position
  this.weight = attrs.weight
}

OccupationsFactor.prototype = new EventEmitter()

_.extend(OccupationsFactor.prototype, {
  toJSON () {
    return {
      id: this.id,
      predicate: this.predicate,
      value: this.value,
      position: this.position,
      weight: this.weight,
    }
  },
})

export default OccupationsFactor
