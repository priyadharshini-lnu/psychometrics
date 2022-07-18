import lodashGet from 'lodash/get'

import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer } from 'utils/redux'

import { FETCH, FetchAction, ADD } from './list'

export type State = number

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchAction) => response.total,
  [ADD]: (state: number) => state + 1,
}

const defaultState: State = 0

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState): State => lodashGet(state, ['sheet', 'total'])
