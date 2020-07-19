import { createReducer } from 'utils/redux'
import { updateIn } from 'utils/immutable'
import _ from 'lodash'
import {
  InitTableReturnType,
  ChangeSortReturnType,
  RemoveFilterReturnType,
  ChangePageReturnType,
  ChangeFilterReturnType,
  INIT_TABLE,
  CHANGE_FILTER,
  CHANGE_PAGE,
  REMOVE_FILTER,
  CHANGE_SORT,
  SET_TABLE_CONFIG,
  ActionsReturnType,
} from './actions'
import { State, TableConfig } from './interfaces'

export const initialState = {
}

export const defaultTableConfig: TableConfig = {
  filters: {},
  sort: {},
  page: 1,
  initialized: false,
  maintainHistory: false,
}

const HANDLERS = {
  [INIT_TABLE]: (state: State, { payload: { tableName, maintainHistory } }: InitTableReturnType) => (
    { ...state, [tableName]: { ...defaultTableConfig, maintainHistory, initialized: !maintainHistory } }
  ),
  [SET_TABLE_CONFIG]: (state: State, { payload: { tableConfig } }: { payload: { tableConfig: TableConfig } }) => (
    _.transform(state, (result: State, config: TableConfig, tableName: string) => {
      if (config.maintainHistory) {
        result[tableName] = { ...config, ...tableConfig, initialized: true }
      }
    })
  ),
  [CHANGE_FILTER]: (state: State,
    { payload: { tableName, filterName, filterValue } }: ChangeFilterReturnType): State => (
    updateIn(
      state,
      [tableName, 'filters'],
      filters => ({ ...filters, [filterName]: filterValue }),
    )
  ),
  [CHANGE_PAGE]: (state: State, { payload: { tableName, pageNumber } }: ChangePageReturnType): State => (
    updateIn(
      state,
      [tableName, 'page'],
      () => pageNumber,
    )
  ),
  [CHANGE_SORT]: (state: State, { payload: { tableName, columnName, order } }: ChangeSortReturnType): State => (
    updateIn(
      state,
      [tableName, 'sort'],
      () => ({ columnName, order }),
    )
  ),
  [REMOVE_FILTER]: (state: State, { payload: { tableName, filterName } }: RemoveFilterReturnType): State => (
    updateIn(
      state,
      [tableName, 'filters'],
      filters => (_.omit(filters, [filterName])),
    )
  ),
}

const reducer: (state: State, action: ActionsReturnType) => State = createReducer(HANDLERS, {})

export default reducer
