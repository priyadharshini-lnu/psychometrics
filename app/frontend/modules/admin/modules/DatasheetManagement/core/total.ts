import _ from 'lodash'
import { RootState } from 'modules/admin/core/rootReducers'
import { createReducer } from 'utils/redux'
import { FETCH, FetchAction } from './list'

const defaultState = 0

export const get = (state: RootState): number => _.get(state, ['datasheet', 'total'])

const HANDLERS = {
  [FETCH]: (_: number, { response }: FetchAction) => response.total,
}

export default createReducer(HANDLERS, defaultState)
