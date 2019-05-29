import { getIn, setIn, updateIn } from 'utils/immutable'
import _ from 'lodash'

export const ADD_SUBJECT_CONDITION = 'threeSixty/nominationRequirement/subjectConditions/ADD_SUBJECT_CONDITION'
export const UPDATE_SUBJECT_CONDITION = 'threeSixty/nominationRequirement/subjectConditions/UPDATE_SUBJECT_CONDITION'
export const REMOVE_SUBJECT_CONDITION = 'threeSixty/nominationRequirement/subjectConditions/REMOVE_SUBJECT_CONDITION'
export const ADD_NEW_LOGIC_SET_CONDITION = 'threeSixty/nominationRequirement/subjectConditions/ADD_NEW_LOGIC_SET_CONDITION'
export const MOVE_CONDITION_TO_NEW_LOGIC_SET = 'threeSixty/nominationRequirement/subjectConditions/MOVE_CONDITION_TO_NEW_LOGIC_SET'

export const add = (index) => ({
  type: ADD_SUBJECT_CONDITION,
  payload: { index }
})

export const remove = (parentIndex, childIndex) => ({
  type: REMOVE_SUBJECT_CONDITION,
  payload: { parentIndex, childIndex }
})

export const update = (parentIndex, childIndex, field, value) => ({
  type: UPDATE_SUBJECT_CONDITION,
  payload: { parentIndex, childIndex, field, value}
})

export const addNewLogicSetCondition = (operator = 'if') => {
  return {
  type: ADD_NEW_LOGIC_SET_CONDITION,
  payload: { operator },
}}

export const moveConditionToNextLogicSet = (parentIndex, childIndex) => ({
  type: MOVE_CONDITION_TO_NEW_LOGIC_SET,
  payload: { parentIndex, childIndex },
})

const defaultCondition = {
  operator: 'and',
  field: 'Gender',
  value: null,
  comparator: 'equal',
}

function removeConditions (state, path, index) {
  return updateIn(state, path, (conditions) => {
    const newConditions = _.filter(conditions, (_, i) => i !== index)
    return newConditions.map((condition, i) => (
      i === 0 ? { ...condition, operator: 'if' } : condition
    ))
  })
}

const HANDLERS = {
  [ADD_SUBJECT_CONDITION]: (state, { payload: { index } }) => {
    return updateIn(state, [index, 'conditions'], conditions => conditions.concat([defaultCondition]))
  },
  [ADD_NEW_LOGIC_SET_CONDITION]: (state, { payload: { operator } }) => (
    state.concat({
      operator,
      conditions: [{ ...defaultCondition, operator: 'if' }],
    })
  ),
  [MOVE_CONDITION_TO_NEW_LOGIC_SET]: (state, { payload: { parentIndex, childIndex } }) => {
    const conditionToMove = getIn(state, [parentIndex, 'conditions', childIndex])
    state = state.concat({
      operator: 'and',
      conditions: [{ ...conditionToMove, operator: 'if' }],
    })
    return removeConditions(state, [parentIndex, 'conditions'], childIndex)
  },
  [REMOVE_SUBJECT_CONDITION]: (state, { payload: { parentIndex, childIndex } }) => {
    const path = [parentIndex, 'conditions']
    const conditions = getIn(state, path)
    if (conditions.length > 1) {
      return removeConditions(state, path, childIndex)
    }
    return removeConditions([state], 0, childIndex)[0]
  },
  [UPDATE_SUBJECT_CONDITION]: (state, { payload: { parentIndex, childIndex, field, value } }) => {
    let path = [parentIndex]
    path = _.isNull(childIndex) ? path : path.concat(['conditions', childIndex])
    return updateIn(state, path, condition => ({
      ...condition,
      [field]: value,
    }))
  },
}

const defaultState = { }

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
