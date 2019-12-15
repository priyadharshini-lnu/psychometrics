import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import Flow from 'models/Flow'
import AppStore from './AppStore'

const FlowStore = function () {
  this.old = null
  this.flow = null
  this.show = false
}

FlowStore.prototype = new EventEmitter()

_.extend(FlowStore.prototype, {
  open () {
    AppStore.fetchQuestions()
    this.show = true
    this.assessment = AppStore.assessment
    this.old = _.cloneDeep(AppStore.assessment.flow)
    this.flow = AppStore.assessment.flow
    this.update()
  },

  save () {
    this.assessment.sync()
    this.show = false
    this.update()
  },

  addElementBelow (flowElement) {
    flowElement.addElementBelow()
    this.update()
  },

  duplicateElement (flowElement) {
    flowElement.duplicateElement()
    this.update()
  },

  close () {
    this.assessment.flow = this.old
    this.flow = null
    this.show = false
    this.update()
  },

  update () {
    this.emit('change')
  },

  // Build new elements tree
  updateFlowElements (tree) {
    this.assessment.flow = new Flow({ elements: this.loadElements(tree.children) })
    this.flow = this.assessment.flow
    this.update()
  },

  // Load inside elements
  loadElements (children) {
    return _.map(children, item => ({
      type: item.module.type,
      props: item.module.props || {},
      elements: this.loadElements(item.children),
    }))
  },

  // Build tree
  getTree () {
    const children = (this.flow === null) ? [] : this.loadChildren(this.flow.elements)
    return {
      module: null,
      children,
    }
  },

  // Load children
  loadChildren (elements) {
    return _.map(elements, element => ({
      module: element,
      children: this.loadChildren(element.elements),
    }))
  },
})

export default new FlowStore()
