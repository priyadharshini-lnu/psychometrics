import lodashGet from 'lodash/get'

import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'

import {
  FETCH, FetchAction, SheetIdentity, sheetKey,
} from './list'

export type Permissions = {
  export: boolean
  import: boolean
  update: boolean
  add: boolean
  delete: boolean
  view: boolean
  edit: boolean
}

export type State = {
  key: string
  values: Permissions
}

const HANDLERS = {
  [FETCH]: (_: State, { response, requestAction }: FetchAction): State => (
    { key: requestAction.sheetKey, values: response.permissions }
  ),
}

const defaultState: State = {
  key: '',
  values: {
    export: false,
    import: false,
    update: false,
    add: false,
    delete: false,
    view: false,
    edit: false,
  },
}

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState, sheet: SheetIdentity): Permissions => {
  const { key, values }: State = lodashGet(state, ['sheet', 'permissions'])

  return key === sheetKey(sheet) ? values : defaultState.values
}
