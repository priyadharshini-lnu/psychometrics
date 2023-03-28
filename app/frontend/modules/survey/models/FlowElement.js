/* eslint-disable no-unused-vars */
import _ from 'lodash'
import { v4 as genUUID } from 'uuid'
import { EventEmitter } from 'fbemitter'
import FlowCondition from './FlowCondition'

const FlowElement = function (attrs = {}, parentPath = null, index = 0) {
  this.uuid = attrs.uuid || genUUID()
  this.type = attrs.type
  this.parent = {}
  this.props = attrs.props || {}
  this.path = _.isArray(parentPath) ? parentPath.concat(index) : [index]
  if (this.props.conditions && this.props.conditions.length) {
    this.props.conditions = _.map(this.props.conditions, condition => new FlowCondition(condition))
  }
  this.elements = this.loadElements(attrs.elements)
}

FlowElement.prototype = new EventEmitter()

_.extend(FlowElement.prototype, {

  recalcPath (parent, index) {
    this.path = parent && parent.path ? parent.path.concat(index) : [index]
    this.elements.map((e, i) => e.recalcPath(this, i))
  },

  newElement () {
    this.elements.push(new FlowElement({}, this.path))
  },

  remove (el) {
    if (el) {
      _.pull(this.elements, el)
    } else {
      this.parent.remove(this)
    }
  },

  loadElements (elements) {
    return _.map(elements, (element, index) => new FlowElement(element, this.path, index))
  },

  toJSON () {
    return {
      uuid: this.uuid,
      type: this.type,
      elements: this.elements,
      path: this.path,
      props: this.props,
    }
  },
})

export default FlowElement
