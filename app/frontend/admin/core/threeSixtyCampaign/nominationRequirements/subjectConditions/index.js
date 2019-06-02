import { getIn, updateIn } from 'utils/immutable'
import _ from 'lodash'
import nested_conditions from 'admin/core/common/nested_conditions'

export const ADD = 'threeSixty/nominationRequirement/subjectConditions/ADD'
export const UPDATE = 'threeSixty/nominationRequirement/subjectConditions/UPDATE'
export const REMOVE = 'threeSixty/nominationRequirement/subjectConditions/REMOVE'
// eslint-disable-next-line max-len
export const ADD_NEW_LOGIC_SET_CONDITION = 'threeSixty/nominationRequirement/subjectConditions/ADD_NEW_LOGIC_SET_CONDITION'
// eslint-disable-next-line max-len
export const MOVE_CONDITION_TO_NEW_LOGIC_SET = 'threeSixty/nominationRequirement/subjectConditions/MOVE_CONDITION_TO_NEW_LOGIC_SET'

const { actions, reducer } = nested_conditions({
  actions: {
    add: ADD,
    remove: REMOVE,
    update: UPDATE,
    addNewLogicalSetCondition: ADD_NEW_LOGIC_SET_CONDITION,
    moveConditionToNextLogicSet: MOVE_CONDITION_TO_NEW_LOGIC_SET
  },
  defaultCondition: {
    operator: 'and',
    field: 'Gender',
    value: null,
    comparator: 'equal',
  }
})

export const { add, remove, update, addNewLogicalSetCondition, moveConditionToNextLogicSet } = actions;

export default reducer
