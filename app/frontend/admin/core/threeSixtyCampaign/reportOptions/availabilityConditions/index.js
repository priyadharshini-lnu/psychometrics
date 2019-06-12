import nestedConditions from 'admin/core/common/nestedConditions'

export const ADD = 'threeSixty/reportOptions/availabilityConditions/ADD'
export const REMOVE = 'threeSixty/reportOptions/availabilityConditions/REMOVE'
export const UPDATE = 'threeSixty/reportOptions/availabilityConditions/UPDATE'
export const ADD_NEW_LOGIC_SET_CONDITION = 'threeSixty/reportOptions/availabilityConditions/ADD_NEW_LOGIC_SET_CONDITION'
// eslint-disable-next-line max-len
export const MOVE_CONDITION_TO_NEW_LOGIC_SET = 'threeSixty/reportOptions/availabilityConditions/MOVE_CONDITION_TO_NEW_LOGIC_SET'

const { actions, reducer } = nestedConditions({
  actionTypes: {
    ADD,
    REMOVE,
    UPDATE,
    ADD_NEW_LOGIC_SET_CONDITION,
    MOVE_CONDITION_TO_NEW_LOGIC_SET,
  },
  defaultCondition: {
    operator: 'and',
    type: 'evaluations',
    numberOfEvaluator: null,
  },
})

export const {
  add, remove, update, addNewLogicalSetCondition, moveConditionToNextLogicSet,
} = actions

export default reducer
