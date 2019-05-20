import { setIn } from 'utils/immutable'
import {
  FETCH_REPORT_OPTIONS,
  UPDATE_REPORT_OPTIONS,
} from './actions'

const HANDLERS = {
  [FETCH_REPORT_OPTIONS]: (_, { response }) => response,
  [UPDATE_REPORT_OPTIONS]: (state, { payload: { key, value } }) => setIn(state, key, value),
}

const defaultState = { access: {}, approval: {}, availability: {} }

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
