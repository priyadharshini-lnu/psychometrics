import lodashGet from 'lodash/get'

import { createReducer } from 'utils/redux'

import { RootState } from 'modules/admin/core/rootReducers'
import { FETCH, FetchAction, Column } from './list'

export type State = Column[]

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchAction) => response.columns,
}

const defaultState: State = []

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'columnDefinitions'])
