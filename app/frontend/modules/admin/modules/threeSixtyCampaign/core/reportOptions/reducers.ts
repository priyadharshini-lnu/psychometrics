import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { setIn, updateIn } from '~/utils/immutable'
import { createReducer } from '~/utils/redux'

import {
  FETCH, UPDATE, UpdateType, UPDATE_LANGUAGES,
} from './actions'
import availabilityConditionsReducer from './availabilityConditions'

interface State {
  access: {},
  approval: {},
  availability: {
    conditions: []
  },
  languages: {},
}

const defaultState: State = {
  access: {},
  approval: {},
  availability: { conditions: [] },
  languages: { reportLocales: [], defaultLanguage: 'en', availableLanguages: [] },
}

type UpdateLanguagesAction = {
  type: typeof UPDATE_LANGUAGES
  response: {
    data: {}
  }
}

export type FetchAction = ApiActionResponse<State>

const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => response,
  [UPDATE]: (state: State, { payload: { key, value } }: UpdateType) => setIn(state, key, value),
  [UPDATE_LANGUAGES]:
    (state: State, { response: { data } }: UpdateLanguagesAction) => updateIn(state, ['languages'], state => ({
      ...state,
      ...data,
    })),
}

export default createReducer(HANDLERS, defaultState, (state, action) => updateIn(
  state, ['availability', 'conditions'], state => availabilityConditionsReducer(state, action),
))
