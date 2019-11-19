import FlowElement from 'models/FlowElement'
import Flow from 'models/Flow'

import {
  ADD_ELEMENT, DUPLICATE_ELEMENT, ADD_NEW_ELEMENT, UPDATE_TREE, REMOVE_ELEMENT, RESET,
} from './types'

const loadElements = children => _.map(children, item => ({
  type: item.module.type,
  props: item.module.props || {},
  elements: loadElements(item.children),
}))

export const addElementBelow = (element) => {
  const newElement = new FlowElement({}, element, element.parent.elements.length)
  return ({ type: ADD_ELEMENT, element, newElement })
}

export const duplicateElement = (element) => {
  const duplicate = new FlowElement(_.cloneDeep(element), element.parent)

  return ({ type: DUPLICATE_ELEMENT, element, duplicate })
}

export const addNew = (parent) => {
  const element = new FlowElement({}, parent, parent.elements.length)
  return ({ type: ADD_NEW_ELEMENT, element })
}

export const updateTree = (tree) => {
  const flow = new Flow({ elements: loadElements(tree.children) })
  return ({ type: UPDATE_TREE, flow })
}

export const removeElement = element => ({ type: REMOVE_ELEMENT, element })

export const reset = flow => ({ type: RESET, flow })
