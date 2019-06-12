import { setIn, updateIn } from 'utils/immutable'

import {
  FETCH,
  UPDATE,
} from './actions'
import availabilityConditionsReducer from './availabilityConditions'

const defaultState = { access: {}, approval: {}, availability: { conditions: [] } }

const HANDLERS = {
  [FETCH]: (_, { response }) => response,
  [UPDATE]: (state, { key, value }) => setIn(state, key, value),
}

export default function reducer (state = defaultState, action) {
  const stateFromInnerReducer = updateIn(
    state, ['availability', 'conditions'], state => availabilityConditionsReducer(state, action),
  )
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}
