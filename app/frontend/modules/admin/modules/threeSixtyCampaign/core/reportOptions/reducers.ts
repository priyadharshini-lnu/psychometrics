import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { setIn, updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'

import { FETCH, UPDATE, UpdateType } from './actions'
import availabilityConditionsReducer from './availabilityConditions'

interface State {
  access: {},
  approval: {},
  availability: {
    conditions: []
  }
}

const defaultState: State = {
  access: {}, approval: {}, availability: { conditions: [] },
}

export type FetchAction = ApiActionResponse<State>

const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => response,
  [UPDATE]: (state: State, { payload: { key, value } }: UpdateType) => setIn(state, key, value),
}

export default createReducer(HANDLERS, defaultState, (state, action) => updateIn(
  state, ['availability', 'conditions'], state => availabilityConditionsReducer(state, action),
))
