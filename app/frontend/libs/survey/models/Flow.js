import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import FlowElement from './FlowElement'

const Flow = function (attrs = {}) {
  this.elements = this.loadElements(attrs.elements)
}

Flow.prototype = new EventEmitter()

_.extend(Flow.prototype, {
  loadElements (elements) {
    return _.map(elements, (element, index) => new FlowElement(element, this, index))
  },

  newElement () {
    this.elements.push(new FlowElement({}, this))
  },

  remove (element) {
    _.pull(this.elements, element)
  },

  toJSON () {
    return {
      elements: this.elements,
    }
  },
})

export default Flow
