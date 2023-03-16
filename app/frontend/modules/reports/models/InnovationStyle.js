import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import InnovationStylesFactor from './InnovationStylesFactor'

const InnovationStyle = function (attrs = {}) {
  this.id = attrs.id
  this.name = attrs.name
  this.icon = attrs.icon
  this.position = attrs.position
  this.description = attrs.description
  this.fullDescription = attrs.full_description
  this.factors = []
  if (attrs.factors) {
    this.factors = _.map(attrs.factors, factor => new InnovationStylesFactor(factor))
  }
}

InnovationStyle.prototype = new EventEmitter()

_.extend(InnovationStyle.prototype, {
  toJSON () {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
    }
  },
})

export default InnovationStyle
