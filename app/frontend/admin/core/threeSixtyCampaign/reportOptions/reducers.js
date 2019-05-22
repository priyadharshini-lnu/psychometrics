import { getIn, setIn, updateIn } from 'utils/immutable'
import _ from 'lodash'

import {
  FETCH_REPORT_OPTIONS,
  UPDATE_REPORT_OPTIONS,
  ADD_AVAILABILITY_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET,
  REMOVE_AVAILABILITY_CONDITION,
  UPDATE_AVAILABILITY_CONDITION,
} from './actions'

const defaultCondition = {
  operator: 'and',
  type: 'evaluations',
  numberOfEvaluator: null,
  relationship: 'Manager',
}

const HANDLERS = {
  [FETCH_REPORT_OPTIONS]: (_, { response }) => response,
  [UPDATE_REPORT_OPTIONS]: (state, { payload: { key, value } }) => setIn(state, key, value),
  [ADD_AVAILABILITY_CONDITION]: (state, { payload: { index } }) => (
    updateIn(state, ['availability', 'conditions', index, 'conditions'],
      conditions => conditions.concat([defaultCondition]))
  ),
  [ADD_NEW_LOGIC_SET_CONDITION]: (state, { payload: { operator } }) => (
    updateIn(state, ['availability', 'conditions'],
      conditions => conditions.concat({
        operator,
        conditions: [{ ...defaultCondition, operator: 'if' }],
      }))
  ),
  [MOVE_CONDITION_TO_NEW_LOGIC_SET]: (state, { payload: { parentIndex, childIndex } }) => (
    updateIn(state, ['availability', 'conditions'],
      conditions => conditions.concat({
        operator: 'and',
        conditions: [{ ...getIn(conditions, [parentIndex, 'conditions', childIndex]), operator: 'if' }],
      }))
  ),
  [REMOVE_AVAILABILITY_CONDITION]: (state, { payload: { parentIndex, childIndex } }) => {
    const path = ['availability', 'conditions', parentIndex, 'conditions']
    const conditions = getIn(state, path)
    if (conditions.length > 1) {
      return updateIn(state, path, conditions => _.filter(conditions, (_, index) => index !== childIndex))
    }
    return updateIn(state, ['availability', 'conditions'], (conditions) => {
      let newConditions = _.filter(conditions, (_, index) => index !== parentIndex)
      newConditions = newConditions.map((condition, index) => (
        index === 0 ? { ...condition, operator: 'if' } : condition
      ))
      return newConditions
    })
  },
  [UPDATE_AVAILABILITY_CONDITION]: (state, {
    payload: {
      parentIndex, childIndex, field, value,
    },
  }) => {
    let path = ['availability', 'conditions', parentIndex]
    path = _.isNull(childIndex) ? path : path.concat(['conditions', childIndex])
    return updateIn(state, path, condition => ({
      ...condition,
      [field]: value,
    }))
  },
}

const defaultState = { access: {}, approval: {}, availability: { conditions: [] } }

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
