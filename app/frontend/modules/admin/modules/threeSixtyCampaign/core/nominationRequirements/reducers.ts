import _ from 'lodash'
import { setIn, updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'
import {
  FETCH,
  ADD,
  REMOVE,
  MOVE_UP,
  MOVE_DOWN,
  CHANGE_SELECTED_INDEX,
  RENAME_SELECTED_NOMINATION,
  COPY_SELECTED_NOMINATION,
  FetchType,
  AddType,
  RemoveType,
  MoveUpType,
  MoveDownType,
  ChangeSelectedIndexType,
  RenameType,
} from './actions'
import subjectConditionReducer from './subjectConditions'
import conditionsReducer from './conditions'

interface Condition {
  relationshipId: number
  comparator: string
  value: number
}
interface Requirement {
  position: number
  name: string
  subjectConditions: Condition[]
  conditions: Condition[]
}
interface State {
  list: Requirement[]
  selectedIndex: number
}

export const defaultState: State = {
  list: [],
  selectedIndex: 0,
}

function move (nominationRequirements, index, offset) {
  const newNominationRequirements = nominationRequirements.map((nominationRequirement, i) => {
    if (i === index - offset) {
      return { ...nominationRequirement, position: nominationRequirement.position + offset }
    } if (i === index) {
      return { ...nominationRequirement, position: nominationRequirement.position - offset }
    }
    return nominationRequirement
  })
  return _.sortBy(newNominationRequirements, 'position')
}

function moveUpRequirement (nominationRequirements, index) {
  return move(nominationRequirements, index, 1)
}

function moveDownRequirement (nominationRequirements, index) {
  return move(nominationRequirements, index, -1)
}

const innerReducers = {
  subjectConditions: subjectConditionReducer,
  conditions: conditionsReducer,
}


const HANDLERS = {
  [FETCH]: (_, { response }: FetchType) => ({ list: response, selectedIndex: 0 }),
  [ADD]: (state: State, { payload: { relationshipId } }: AddType) => {
    const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
    return {
      ...state,
      list: [...state.list, {
        position: maxPosition + 1,
        name: 'Default Requirement',
        subjectConditions: [],
        conditions: [
          {
            relationshipId,
            comparator: 'atleast',
            value: '2',
          },
        ],
      }],
    }
  },
  [RENAME_SELECTED_NOMINATION]: (state: State, { payload: { name } }: RenameType) => (
    setIn(state, ['list', state.selectedIndex, 'name'], name)
  ),
  [COPY_SELECTED_NOMINATION]: (state: State) => {
    const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
    const selectedNomination = { ..._.get(state, ['list', state.selectedIndex]), position: maxPosition + 1, id: null }
    return updateIn(state, 'list', nominationRequirements => nominationRequirements.concat(selectedNomination))
  },
  [REMOVE]: (state: State, { payload: { index } }: RemoveType) => (
    { ...state, selectedIndex: 0, list: state.list.filter((_, i) => index !== i) }
  ),
  [MOVE_UP]: (state: State, { payload: { index } }: MoveUpType) => (
    { ...state, selectedIndex: state.selectedIndex - 1, list: moveUpRequirement(state.list, index) }
  ),
  [MOVE_DOWN]: (state: State, { payload: { index } }: MoveDownType) => (
    { ...state, selectedIndex: state.selectedIndex + 1, list: moveDownRequirement(state.list, index) }
  ),
  [CHANGE_SELECTED_INDEX]: (state: State, { payload: { index } }: ChangeSelectedIndexType) => (
    { ...state, selectedIndex: index }
  ),
}

export default createReducer(HANDLERS, defaultState, (state, action) => _.reduce(
  innerReducers,
  (state, reducer, branchName) => (
    state.list.length > 0
      ? updateIn(state, ['list', state.selectedIndex, branchName], subState => reducer(subState, action))
      : state
  ),
  state,
))
