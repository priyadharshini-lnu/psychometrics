import lodashGet from 'lodash/get'

import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer } from 'utils/redux'

import { FETCH, FetchAction } from './list'

export type State = {
  export: boolean
  import: boolean
  update: boolean
  add: boolean
  delete: boolean
  view: boolean
  edit: boolean
}

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchAction) => response.permissions,
}

const defaultState: State = {
  export: false,
  import: false,
  update: false,
  add: false,
  delete: false,
  view: false,
  edit: false,
}

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'permissions'])
