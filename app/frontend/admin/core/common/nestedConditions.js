
import { getIn, updateIn } from 'utils/immutable'
import _ from 'lodash'

export default ({
  defaultCondition,
  actionTypes: { ADD, REMOVE, UPDATE, ADD_NEW_LOGIC_SET_CONDITION, MOVE_CONDITION_TO_NEW_LOGIC_SET }
}) => {
  const removeConditions = (state, path, index) => updateIn(state, path, (conditions) => {
    const newConditions = _.filter(conditions, (_, i) => i !== index)
    return newConditions.map((condition, i) => (
      i === 0 ? { ...condition, operator: 'if' } : condition
    ))
  })

  const HANDLERS = {
    [ADD]: (state, { payload: { index, condition } }) => {
      const passedCondition = condition || {}
      return updateIn(
        state,
        [index, 'conditions'],
        conditions => [...conditions, { ...defaultCondition, ...passedCondition }],
      )
    },
    [REMOVE]: (state, { payload: { parentIndex, childIndex } }) => {
      const path = [parentIndex, 'conditions']
      const conditions = getIn(state, path)
      if (conditions.length > 1) {
        return removeConditions(state, path, childIndex)
      }
      return removeConditions([state], 0, childIndex)[0]
    },
    [UPDATE]: (state, {
      payload: {
        parentIndex, childIndex, field, value,
      },
    }) => {
      let path = [parentIndex]
      path = _.isNull(childIndex) ? path : [...path, 'conditions', childIndex]
      return updateIn(state, path, condition => ({
        ...condition,
        [field]: value,
      }))
    },
    [ADD_NEW_LOGIC_SET_CONDITION]: (state, { payload: { operator } }) => (
      state.concat({
        operator,
        conditions: [{ ...defaultCondition, operator: 'if' }],
      })
    ),
    [MOVE_CONDITION_TO_NEW_LOGIC_SET]: (state, { payload: { parentIndex, childIndex } }) => {
      const conditionToMove = getIn(state, [parentIndex, 'conditions', childIndex])
      const newState = state.concat({
        operator: 'and',
        conditions: [{ ...conditionToMove, operator: 'if' }],
      })
      return removeConditions(newState, [parentIndex, 'conditions'], childIndex)
    },
  }

  return {
    actions: {
      add: index => ({
        type: ADD,
        payload: { index },
      }),
      remove: (parentIndex, childIndex) => ({
        type: REMOVE,
        payload: { parentIndex, childIndex },
      }),
      update: (parentIndex, childIndex, field, value) => ({
        type: UPDATE,
        payload: {
          parentIndex, childIndex, field, value,
        },
      }),
      addNewLogicalSetCondition: (operator = 'if') => ({
        type: ADD_NEW_LOGIC_SET_CONDITION,
        payload: { operator },
      }),
      moveConditionToNextLogicSet: (parentIndex, childIndex) => ({
        type: MOVE_CONDITION_TO_NEW_LOGIC_SET,
        payload: { parentIndex, childIndex },
      }),
    },
    reducer: (state = {}, action) => {
      const handler = HANDLERS[action.type]
      return handler ? handler(state, action) : state
    },
  }
}
