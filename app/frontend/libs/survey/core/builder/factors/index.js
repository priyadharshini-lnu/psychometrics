import { createReducer } from 'utils/reduxUtils'
import { setIn } from 'utils/immutable'
import { INIT } from './actions'

const HANDLERS = {
  [INIT]: (state, { data }) => setIn(state, ['factors'], data.entities.factors),
}

export const defaultState = {
  current: null,
  factors: [],
}

export default createReducer(HANDLERS, defaultState)
