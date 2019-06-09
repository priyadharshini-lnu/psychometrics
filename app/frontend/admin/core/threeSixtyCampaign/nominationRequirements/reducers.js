import { setIn, updateIn } from 'utils/immutable'
import _ from 'lodash'
import {
  FETCH,
  ADD,
  REMOVE,
  MOVE_UP,
  MOVE_DOWN,
  CHANGE_SELECTED_INDEX,
  RENAME_SELECTED_NOMINATION,
  COPY_SELECTED_NOMINATION,
} from './actions'
import subjectConditionReducer from './subjectConditions'
import conditionsReducer from './conditions'

export const defaultState = {
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
  [FETCH]: (_, { response }) => ({ list: response, selectedIndex: 0 }),
  [ADD]: (state, { payload: { relationshipId } }) => {
    const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
    return {
      ...state,
      list: state.list.concat({
        position: maxPosition + 1,
        name: 'Default Requirement',
        subjectConditions: [],
        conditions: [
          {
            relationshipId,
            comparator: 'atleast',
            value: 2,
          },
        ],
      }),
    }
  },
  [RENAME_SELECTED_NOMINATION]: (state, { payload: { name } }) => (
    setIn(state, ['list', state.selectedIndex, 'name'], name)
  ),
  [COPY_SELECTED_NOMINATION]: (state) => {
    const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
    const selectedNomination = { ..._.get(state, ['list', state.selectedIndex]), position: maxPosition + 1, id: null }
    return updateIn(state, 'list', nominationRequirements => nominationRequirements.concat(selectedNomination))
  },
  [REMOVE]: (state, { payload: index }) => (
    { ...state, selectedIndex: 0, list: _.filter(state.list, (_, i) => index !== i) }
  ),
  [MOVE_UP]: (state, { payload: { index } }) => (
    { ...state, selectedIndex: state.selectedIndex - 1, list: moveUpRequirement(state.list, index) }
  ),
  [MOVE_DOWN]: (state, { payload: { index } }) => (
    { ...state, selectedIndex: state.selectedIndex + 1, list: moveDownRequirement(state.list, index) }
  ),
  [CHANGE_SELECTED_INDEX]: (state, { payload: { index } }) => (
    { ...state, selectedIndex: index }
  ),
}

export default function reducer (state = defaultState, action) {
  const stateFromInnerReducer = _.reduce(
    innerReducers,
    (state, reducer, branchName) => (
      updateIn(state, ['list', state.selectedIndex, branchName], subState => reducer(subState, action))
    ),
    state,
  )
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}
