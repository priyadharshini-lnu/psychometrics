import { denormalize } from 'normalizr'
import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { getIn, setIn, updateIn } from '~/utils/immutable'
import schema from '~/modules/survey/store/schema'
import FlowElement from '~/modules/survey/models/FlowElement'
import {
  INIT, ADD_ELEMENT, DUPLICATE_ELEMENT, ADD_NEW_ELEMENT, UPDATE_TREE, REMOVE_ELEMENT, RESET, UPDATE_ELEMENT,
} from './actions'

const lookUpPath = (element) => {
  const path = _.flatten(element.path.map(i => ['elements', i]))
  path.pop()
  return path
}

const getRealPath = (state, path) => {
  let p = ['elements']
  let strPath = ''
  return path.map((i) => {
    if (i === 'elements') { return i }
    strPath += `${i}`
    const index = _.findIndex(getIn(state, p), el => el.path.join('') === strPath)
    p = [...p, index, 'elements']
    return index
  })
}

const HANDLERS = {
  [INIT]: (__, { data }) => {
    const { flow } = denormalize(data.result, schema, data.entities)
    return { elements: _.map((flow?.elements || { elements: [] }), (el, i) => new FlowElement(el, null, i)) }
  },
  [RESET]: (_, { flow }) => flow,
  [UPDATE_TREE]: (_, { flow }) => flow,
  [ADD_NEW_ELEMENT]: (state, { element }) => {
    const path = lookUpPath(element)
    const { parent } = element
    let newState = state
    if (parent.type === 'Randomizer' && parent.props.number + 1 === parent.elements.length) {
      parent.props.number += 1
      const path = lookUpPath(parent)
      newState = setIn(newState, [...path, 'props', 'number'], getIn(parent, ['props', 'number']) + 1)
    }

    const realPath = getRealPath(state, path)
    return updateIn(newState, realPath, elements => elements.concat(element))
  },
  [ADD_ELEMENT]: (state, { element, newElement }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => _.isEqual(el.uuid, element.uuid))
    return updateIn(state, path, (elements) => {
      const rightElements = elements.slice(index + 1, elements.length).map(
        el => setIn(el, ['path', el.path.length - 1], el.path[el.path.length - 1] + 1),
      )
      return [...elements.slice(0, index + 1), newElement, ...rightElements]
    })
  },
  [UPDATE_ELEMENT]: (state, { element }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => (_.isEqual(el.uuid, element.uuid)))
    if (index < 0) return state
    return setIn(state, [...path, index], element)
  },
  [DUPLICATE_ELEMENT]: (state, { element, duplicate }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => _.isEqual(el.uuid, element.uuid))
    return updateIn(state, path, elements => elements.splice(index + 1, 0, duplicate) && elements)
  },
  [REMOVE_ELEMENT]: (state, { element }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => (el.path
      ? _.isEqual(el.uuid, element.uuid)
      : _.isEqual(el.path, element.path)))
    if (index < 0) return state
    return updateIn(state, path, elements => elements.splice(index, 1) && elements)
  },
}

export const defaultState = {
  elements: [],
}

export default createReducer(HANDLERS, defaultState)
