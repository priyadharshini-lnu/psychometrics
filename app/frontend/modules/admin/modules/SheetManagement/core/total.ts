import lodashGet from 'lodash/get'

import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'

import {
  FETCH, FetchAction, ADD, SheetIdentity, sheetKey,
} from './list'

export interface State {
  key: string
  count: number
}

const HANDLERS = {
  [FETCH]: (_: State, { response, requestAction }: FetchAction): State => (
    { key: requestAction.sheetKey, count: response.total }
  ),
  [ADD]: (state: State): State => ({ ...state, count: state.count + 1 }),
}

const defaultState: State = { key: '', count: 0 }

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState, sheet: SheetIdentity): number => {
  const { key, count }: State = lodashGet(state, ['sheet', 'total'])

  return key === sheetKey(sheet) ? count : defaultState.count
}
