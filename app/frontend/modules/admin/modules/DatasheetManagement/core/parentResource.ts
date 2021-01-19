import lodashGet from 'lodash/get'

import { RootState } from 'modules/admin/core/rootReducers'

import { createReducer } from 'utils/redux'

export interface State {
  id?: number
  type?: string
}

const defaultState: State = {}

export default createReducer({}, defaultState)

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'parentResource'])
