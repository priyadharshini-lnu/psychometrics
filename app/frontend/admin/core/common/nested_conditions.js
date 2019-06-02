
import { getIn, updateIn } from 'utils/immutable'
import _ from 'lodash'

export default ({ defaultCondition, actions }) => {
  const removeConditions = (state, path, index) => {
    return updateIn(state, path, (conditions) => {
      const newConditions = _.filter(conditions, (_, i) => i !== index)
      return newConditions.map((condition, i) => (
        i === 0 ? { ...condition, operator: 'if' } : condition
      ))
    })
  }

  const HANDLERS = {
    [actions.add]: (state, { payload: { index, condition } }) => {
      const passedCondition = condition || {}
      return updateIn(state, [index, 'conditions'], conditions => conditions.concat([{...defaultCondition, ...passedCondition}]))
    },
    [actions.remove]: (state, { payload: { parentIndex, childIndex } }) => {
      const path = [parentIndex, 'conditions']
      const conditions = getIn(state, path)
      if (conditions.length > 1) {
        return removeConditions(state, path, childIndex)
      }
      return removeConditions([state], 0, childIndex)[0]
    },
    [actions.update]: (state, {
      payload: {
        parentIndex, childIndex, field, value,
      },
    }) => {
      let path = [parentIndex]
      path = _.isNull(childIndex) ? path : path.concat(['conditions', childIndex])
      return updateIn(state, path, condition => ({
        ...condition,
        [field]: value,
      }))
    },
    [actions.addNewLogicalSetCondition]: (state, { payload: { operator } }) => (
      state.concat({
        operator,
        conditions: [{ ...defaultCondition, operator: 'if' }],
      })
    ),
    [actions.moveConditionToNextLogicSet]: (state, { payload: { parentIndex, childIndex } }) => {
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
        type: actions.add,
        payload: { index },
      }),
      remove: (parentIndex, childIndex) => ({
        type: actions.remove,
        payload: { parentIndex, childIndex },
      }),
      update: (parentIndex, childIndex, field, value) => ({
        type: actions.update,
        payload: {
          parentIndex, childIndex, field, value,
        },
      }),
      addNewLogicalSetCondition: (operator = 'if') => ({
        type: actions.addNewLogicalSetCondition,
        payload: { operator },
      }),
      moveConditionToNextLogicSet: (parentIndex, childIndex) => ({
        type: actions.moveConditionToNextLogicSet,
        payload: { parentIndex, childIndex },
      })
    },
    reducer: (state = {}, action) => {
      const handler = HANDLERS[action.type]
      return handler ? handler(state, action) : state
    }
  }
}
