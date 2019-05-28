import { takeLatest, put } from 'redux-saga/effects'
import { updateIn } from 'utils/immutable'
import _ from 'lodash'
import subjectConditionReducer, {
  ADD_SUBJECT_CONDITION,
  UPDATE_SUBJECT_CONDITION,
  REMOVE_SUBJECT_CONDITION
} from './subjectConditions'

import conditionsReducer, {
  ADD_CONDITION,
  UPDATE_CONDITION,
  REMOVE_CONDITION
} from './conditions'

const FETCH_NOMINATION_REQUIREMENTS = 'threeSixty/FETCH_NOMINATION_REQUIREMENTS'
const ADD_NOMINATION_REQUIREMENT = 'threeSixty/ADD_NOMINATION_REQUIREMENT'
const REMOVE_NOMINATION_REQUIREMENT = 'threeSixty/REMOVE_NOMINATION_REQUIREMENT'
const MOVE_UP_NOMINATION_REQUIREMENT = 'threeSixty/MOVE_UP_NOMINATION_REQUIREMENT'
const MOVE_DOWN_NOMINATION_REQUIREMENT = 'threeSixty/MOVE_DOWN_NOMINATION_REQUIREMENT'

export const defaultState = [
 {
   id: 1,
   position: 1,
   name: 'Requirement1',
   subjectConditions: [
     {
       field: 'Gender',
       operator: 'equal',
       value: 'Male'
     }
   ],
   conditions: [
     {
       relationship: 'Manager',
       operator: 'atleast',
       value: 2
     }
   ]
 }
]

export const fetchNominationRequirements = campaignId => ({
  type: FETCH_NOMINATION_REQUIREMENTS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/nomination_requirements`,
  },
})

function move(nominationRequirements, direction) {
  const offset = direction === 'up' ? 1 : 0
  return nominationRequirements.map((nominationRequirement, index) => {
    if (index === payload.index - offset) {
      return { ...nominationRequirement, position: nominationRequirement.position + offset }
    } else if (index === payload.index) {
      return { ...nominationRequirement, position: nominationRequirement.position - offset }
    } else {
      return nominationRequirement
    }
  })
}

export default function reducer (state = defaultState, { type, payload }) {
  switch (type) {
    case FETCH_NOMINATION_REQUIREMENTS:
      return defaultState;
    case ADD_NOMINATION_REQUIREMENT:
      const maxPosition = _.maxBy(state, 'position')
      return state.contact({
        position: maxPosition + 1,
        name: 'Default Requirement',
        subjectConditions: [],
        conditions: []
      })
    case REMOVE_NOMINATION_REQUIREMENT:
      return _.filter(state, (_, i) => payload.index !== i)
    case MOVE_UP_NOMINATION_REQUIREMENT:
      return move(state, 'up')
    case MOVE_DOWN_NOMINATION_REQUIREMENT:
      return move(state, 'down')
    case ADD_SUBJECT_CONDITION:
    case UPDATE_SUBJECT_CONDITION:
    case REMOVE_SUBJECT_CONDITION:
      return updateIn(
        state,
        [index, 'subjectConditions'],
        (subjectConditions) => subjectConditionReducer(subjectConditions, { type, payload })
      )
    case ADD_CONDITION:
    case UPDATE_CONDITION:
    case REMOVE_CONDITION:
      return updateIn(
        state,
        [index, 'conditions'],
        (conditions) => conditionsReducer(conditions, { type, payload })
      )
    default:
      return state
  }
}
