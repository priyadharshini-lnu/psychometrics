import FlowElement from 'models/FlowElement'
import Flow from 'models/Flow'

export const INIT = 'survey/assessment/INIT'
export const ADD_ELEMENT = 'survey/flow/ADD_ELEMENT'
export const ADD_NEW_ELEMENT = 'survey/flow/ADD_NEW_ELEMENT'
export const DUPLICATE_ELEMENT = 'survey/flow/DUPLICATE_ELEMENT'
export const UPDATE_TREE = 'survey/flow/UPDATE_TREE'
export const REMOVE_ELEMENT = 'survey/flow/REMOVE_ELEMENT'
export const RESET = 'survey/flow/RESET'

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
