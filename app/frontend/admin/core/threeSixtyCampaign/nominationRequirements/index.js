import { updateIn } from 'utils/immutable'
import _ from 'lodash'
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

const FETCH = 'threeSixty/nominationRequirement/FETCH'
const ADD = 'threeSixty/nominationRequirement/ADD'
const REMOVE = 'threeSixty/nominationRequirement/REMOVE'
const MOVE_UP = 'threeSixty/nominationRequirement/MOVE_UP'
const MOVE_DOWN = 'threeSixty/nominationRequirement/MOVE_DOWN'
const CHANGE_SELECTED_INDEX = 'threeSixty/nominationRequirement/CHANGE_SELECTED_INDEX'
const RENAME_SELECTED_NOMINATION = 'threeSixty/nominationRequirement/RENAME'
const COPY_SELECTED_NOMINATION = 'threeSixty/nominationRequirement/COPY'
const SYNC_WITH_SERVER = 'threeSixty/nominationRequirement/SYNC_WITH_SERVER'

export const defaultState = {
  list: [{
    id: 1,
    position: 1,
    name: 'Requirement1',
    subjectConditions: [],
    conditions: [
      {
        relationshipId: 1,
        comparator: 'atleast',
        value: 2,
      },
    ],
  }],
  selectedIndex: 0,
}

export const fetch = campaignId => ({
  type: FETCH,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements`,
  },
})

export const add = (payload) => ({
  type: ADD,
  payload
})

export const remove = index => ({
  type: REMOVE,
  payload: { index },
})

export const moveUp = index => ({
  type: MOVE_UP,
  payload: { index },
})

export const moveDown = index => ({
  type: MOVE_DOWN,
  payload: { index },
})

export const changeSelectedIndex = index => ({
  type: CHANGE_SELECTED_INDEX,
  payload: { index },
})

export const rename = name => ({
  type: RENAME_SELECTED_NOMINATION,
  payload: { name },
})

export const copy = () => ({
  type: COPY_SELECTED_NOMINATION,
})

export const syncWithServer = (body) => ({
  type: SYNC_WITH_SERVER,
  request: {
    type: 'put',
    body
  }
})

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
      const selectedNomination = { ..._.get(state, ['list', state.selectedIndex]), position: maxPosition + 1 }
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
