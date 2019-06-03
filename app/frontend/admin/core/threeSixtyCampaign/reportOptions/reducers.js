import { setIn, updateIn } from 'utils/immutable'

import {
  FETCH,
  UPDATE,
} from './actions'

import availabilityConditionReducer, {
  ADD as ADD_AVAILABILITY_CONDITION,
  REMOVE as REMOVE_AVAILABILITY_CONDITION,
  UPDATE as UPDATE_AVAILABILITY_CONDITION,
  ADD_NEW_LOGIC_SET_CONDITION,
  MOVE_CONDITION_TO_NEW_LOGIC_SET,
} from './availabilityConditions'

const defaultState = { access: {}, approval: {}, availability: { conditions: [] } }


export default function reducer (state = defaultState, { type, payload, response }) {
  switch (type) {
    case FETCH:
      return response
    case UPDATE: {
      const { key, value } = payload
      return setIn(state, key, value)
    }
    case ADD_AVAILABILITY_CONDITION:
    case UPDATE_AVAILABILITY_CONDITION:
    case REMOVE_AVAILABILITY_CONDITION:
    case ADD_NEW_LOGIC_SET_CONDITION:
    case MOVE_CONDITION_TO_NEW_LOGIC_SET:
      return updateIn(
        state,
        ['availability', 'conditions'],
        subjectConditions => availabilityConditionReducer(subjectConditions, { type, payload }),
      )
    default:
      return state
  }
}
