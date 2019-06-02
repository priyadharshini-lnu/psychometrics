import { updateIn } from 'utils/immutable'
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
import subjectConditionReducer, {
  ADD_SUBJECT_CONDITION,
  UPDATE_SUBJECT_CONDITION,
  REMOVE_SUBJECT_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET,
} from './subjectConditions'

import conditionsReducer, {
  ADD_CONDITION,
  UPDATE_CONDITION,
  REMOVE_CONDITION,
} from './conditions'

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

export default function reducer (state = defaultState, { type, payload, response }) {
  switch (type) {
    case FETCH:
      return { list: response, selectedIndex: 0 }
    case ADD: {
      const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
      return {
        ...state,
        list: state.list.concat({
          position: maxPosition + 1,
          name: 'Default Requirement',
          subjectConditions: [],
          conditions: [
            {
              relationshipId: payload.relationshipId,
              comparator: 'atleast',
              value: 2,
            },
          ],
        }),
      }
    }
    case RENAME_SELECTED_NOMINATION:
      return updateIn(
        state,
        ['list', state.selectedIndex, 'name'],
        () => payload.name,
      )
    case COPY_SELECTED_NOMINATION: {
      const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
      const selectedNomination = { ..._.get(state, ['list', state.selectedIndex]), position: maxPosition + 1, id: null }
      return updateIn(state, 'list', nominationRequirements => nominationRequirements.concat(selectedNomination))
    }
    case REMOVE:
      return { ...state, selectedIndex: 0, list: _.filter(state.list, (_, i) => payload.index !== i) }
    case MOVE_UP: {
      return { ...state, selectedIndex: state.selectedIndex - 1, list: moveUpRequirement(state.list, payload.index) }
    }
    case MOVE_DOWN:
      return { ...state, selectedIndex: state.selectedIndex + 1, list: moveDownRequirement(state.list, payload.index) }
    case CHANGE_SELECTED_INDEX:
      return { ...state, selectedIndex: payload.index }
    case ADD_SUBJECT_CONDITION:
    case UPDATE_SUBJECT_CONDITION:
    case REMOVE_SUBJECT_CONDITION:
    case ADD_NEW_LOGIC_SET_CONDITION:
    case MOVE_CONDITION_TO_NEW_LOGIC_SET:
      return updateIn(
        state,
        ['list', state.selectedIndex, 'subjectConditions'],
        subjectConditions => subjectConditionReducer(subjectConditions, { type, payload }),
      )
    case ADD_CONDITION:
    case UPDATE_CONDITION:
    case REMOVE_CONDITION:
      return updateIn(
        state,
        ['list', state.selectedIndex, 'conditions'],
        conditions => conditionsReducer(conditions, { type, payload }),
      )
    default:
      return state
  }
}
