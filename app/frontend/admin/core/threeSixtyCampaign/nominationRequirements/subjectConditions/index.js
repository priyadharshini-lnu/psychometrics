import nestedConditions from 'admin/core/common/nestedConditions'

export const ADD = 'threeSixty/nominationRequirement/subjectConditions/ADD'
export const UPDATE = 'threeSixty/nominationRequirement/subjectConditions/UPDATE'
export const REMOVE = 'threeSixty/nominationRequirement/subjectConditions/REMOVE'
// eslint-disable-next-line max-len
export const ADD_NEW_LOGIC_SET_CONDITION = 'threeSixty/nominationRequirement/subjectConditions/ADD_NEW_LOGIC_SET_CONDITION'
// eslint-disable-next-line max-len
export const MOVE_CONDITION_TO_NEW_LOGIC_SET = 'threeSixty/nominationRequirement/subjectConditions/MOVE_CONDITION_TO_NEW_LOGIC_SET'

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
    value: null,
    comparator: 'equal',
  },
})

export const {
  add, remove, update, addNewLogicalSetCondition, moveConditionToNextLogicSet,
} = actions

export default reducer
