import nestedConditions from 'admin/core/common/nestedConditions'

export const ADD = 'threeSixty/reportOptions/availabilityConditions/ADD'
export const REMOVE = 'threeSixty/reportOptions/availabilityConditions/REMOVE'
export const UPDATE = 'threeSixty/reportOptions/availabilityConditions/UPDATE'
export const ADD_NEW_LOGIC_SET_CONDITION = 'threeSixty/reportOptions/availabilityConditions/ADD_NEW_LOGIC_SET_CONDITION'
// eslint-disable-next-line max-len
export const MOVE_CONDITION_TO_NEW_LOGIC_SET = 'threeSixty/reportOptions/availabilityConditions/MOVE_CONDITION_TO_NEW_LOGIC_SET'

const { actions, reducer } = nestedConditions({
  actions: {
    add: ADD,
    remove: REMOVE,
    update: UPDATE,
    addNewLogicalSetCondition: ADD_NEW_LOGIC_SET_CONDITION,
    moveConditionToNextLogicSet: MOVE_CONDITION_TO_NEW_LOGIC_SET,
  },
  defaultCondition: {
    operator: 'and',
    type: 'evaluations',
    numberOfEvaluator: null,
    relationship: 'Manager',
  },
})

export const {
  add, remove, update, addNewLogicalSetCondition, moveConditionToNextLogicSet,
} = actions

export default reducer
