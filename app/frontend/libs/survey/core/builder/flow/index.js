import { createReducer } from 'utils/reduxUtils'
import { getIn, setIn, updateIn } from 'utils/immutable'
import schema from 'store/schema'
import { denormalize } from 'normalizr'
import {
  INIT, ADD_ELEMENT, DUPLICATE_ELEMENT, ADD_NEW_ELEMENT, UPDATE_TREE, REMOVE_ELEMENT, RESET,
} from './actions'

const lookUpPath = (element) => {
  const path = _.flatten(element.path.map(i => ['elements', i]))
  path.pop()
  return path
}

const HANDLERS = {
  [INIT]: (_, { data }) => denormalize(data.result, schema, data.entities).flow,
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

    return updateIn(newState, path, elements => elements.concat(element))
  },
  [ADD_ELEMENT]: (state, { element, newElement }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => _.isEqual(el.path, element.path))
    return updateIn(state, path, elements => elements.splice(index + 1, 0, newElement) && elements)
  },
  [DUPLICATE_ELEMENT]: (state, { element, duplicate }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => _.isEqual(el.path, element.path))
    return updateIn(state, path, elements => elements.splice(index + 1, 0, duplicate) && elements)
  },
  [REMOVE_ELEMENT]: (state, { element }) => {
    const path = lookUpPath(element)
    const index = _.findIndex(getIn(state, path), el => _.isEqual(el.path, element.path))
    if (index < 0) return state
    return updateIn(state, path, elements => elements.splice(index, 1) && elements)
  },
}

export const defaultState = {
  elements: [],
}

export default createReducer(HANDLERS, defaultState)
