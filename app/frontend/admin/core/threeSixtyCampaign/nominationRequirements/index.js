import { takeLatest, put } from 'redux-saga/effects'
import { updateIn } from 'utils/immutable'
import _ from 'lodash'
import subjectConditionReducer, {
  ADD_SUBJECT_CONDITION,
  UPDATE_SUBJECT_CONDITION,
  REMOVE_SUBJECT_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET
} from './subjectConditions'

import conditionsReducer, {
  ADD_CONDITION,
  UPDATE_CONDITION,
  REMOVE_CONDITION
} from './conditions'

const FETCH_NOMINATION_REQUIREMENTS = 'threeSixty/nominationRequirement/FETCH_NOMINATION_REQUIREMENTS'
const ADD_NOMINATION_REQUIREMENT = 'threeSixty/nominationRequirement/ADD_NOMINATION_REQUIREMENT'
const REMOVE_NOMINATION_REQUIREMENT = 'threeSixty/nominationRequirement/REMOVE_NOMINATION_REQUIREMENT'
const MOVE_UP_NOMINATION_REQUIREMENT = 'threeSixty/nominationRequirement/MOVE_UP_NOMINATION_REQUIREMENT'
const MOVE_DOWN_NOMINATION_REQUIREMENT = 'threeSixty/nominationRequirement/MOVE_DOWN_NOMINATION_REQUIREMENT'
const CHANGE_SELECTED_INDEX = 'threeSixty/nominationRequirement/CHANGE_SELECTED_INDEX'

export const defaultState = {
  list: [{
   id: 1,
   position: 1,
   name: 'Requirement1',
   subjectConditions: [],
   conditions: [
     {
       relationship: 'Manager',
       operator: 'atleast',
       value: 2
     }
   ]
 }],
 selectedIndex: 0
}

export const fetchNominationRequirements = campaignId => ({
  type: FETCH_NOMINATION_REQUIREMENTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements`,
  },
})

export const add = campaignId => ({
  type: ADD_NOMINATION_REQUIREMENT,
  payload: { campaignId }
})

export const remove = (campaignId, index) => ({
  type: REMOVE_NOMINATION_REQUIREMENT,
  payload: { campaignId, index }
})

export const moveUp = (campaignId, index) => ({
  type: MOVE_UP_NOMINATION_REQUIREMENT,
  payload: { campaignId, index }
})

export const moveDown = (campaignId, index) => ({
  type: MOVE_DOWN_NOMINATION_REQUIREMENT,
  payload: { campaignId, index }
})

export const changeSelectedIndex = (index) => ({
  type: CHANGE_SELECTED_INDEX,
  payload: { index }
})

function moveUpRequirement(nominationRequirements, index) {
  if (index === 0) { return nominationRequirements }
  return move(nominationRequirements, index, 1)
}

function moveDownRequirement(nominationRequirements, index) {
  if (index === nominationRequirements.length - 1) { return nominationRequirements }
  return move(nominationRequirements, index, -1)
}

function move(nominationRequirements, index, offset) {
  nominationRequirements = nominationRequirements.map((nominationRequirement, i) => {
    if (i === index - offset) {
      return { ...nominationRequirement, position: nominationRequirement.position + offset }
    } else if (i === index) {
      return { ...nominationRequirement, position: nominationRequirement.position - offset }
    } else {
      return nominationRequirement
    }
  })
  return _.sortBy(nominationRequirements, 'position')
}

export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case FETCH_NOMINATION_REQUIREMENTS:
      return defaultState;
    case ADD_NOMINATION_REQUIREMENT:
      const maxPosition = _.get(_.maxBy(state.list, 'position'), 'position', 0)
      return { ...state, list: state.list.concat({
        position: maxPosition + 1,
        name: 'Default Requirement',
        subjectConditions: [],
        conditions: []
      })}
    case REMOVE_NOMINATION_REQUIREMENT:
      return { ...state, list: _.filter(state.list, (_, i) => payload.index !== i) }
    case MOVE_UP_NOMINATION_REQUIREMENT:
      return { ...state, list: moveUpRequirement(state.list, payload.index) }
    case MOVE_DOWN_NOMINATION_REQUIREMENT:
      return { ...state, list: moveDownRequirement(state.list, payload.index) }
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
        (subjectConditions) => subjectConditionReducer(subjectConditions, { type, payload })
      )
    case ADD_CONDITION:
    case UPDATE_CONDITION:
    case REMOVE_CONDITION:
      return updateIn(
        state,
        ['list',  state.selectedIndex, 'conditions'],
        (conditions) => conditionsReducer(conditions, { type, payload })
      )
    default:
      return state
  }
}
