import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { updateIn } from '~/utils/immutable'
import { DEFAULT_PAGE_SIZE } from '~/constants/campaign'
import {
  InitTableReturnType,
  ChangeSortReturnType,
  RemoveFilterReturnType,
  RemoveAllFiltersReturnType,
  ChangePageReturnType,
  ChangeFilterReturnType,
  SetFiltersReturnType,
  SetTableConfigFromUrlType,
  INIT_TABLE,
  CHANGE_FILTER,
  CHANGE_PAGE,
  REMOVE_FILTER,
  REMOVE_ALL_FILTERS,
  SET_FILTERS,
  CHANGE_SORT,
  SET_TABLE_CONFIG,
  REMOVE_SORT,
} from './actions'
import { State, TableConfig } from './interfaces'

export const initialState = {}

export const defaultTableConfig: TableConfig = {
  filters: {},
  sort: {},
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  initialized: false,
  maintainHistory: false,
}

const HANDLERS = {
  [INIT_TABLE]: (state: State, { payload: { tableName, maintainHistory, pageSize } }: InitTableReturnType) => (
    {
      ...state,
      [tableName]: {
        ...defaultTableConfig, maintainHistory, initialized: !maintainHistory, pageSize,
      },
    }
  ),
  [SET_TABLE_CONFIG]: (state: State, { payload: { tableConfig } }: SetTableConfigFromUrlType) => (
    _.transform(state, (result: State, config: TableConfig, tableName: string) => {
      result[tableName] = { ...config, ...tableConfig, initialized: true }
    })
  ),
  [CHANGE_FILTER]: (state: State,
    { payload: { tableName, filterName, filterValue } }: ChangeFilterReturnType) => {
    const config = state[tableName]
    return {
      ...state,
      [tableName]: {
        ...config,
        filters: ({ ...config.filters, [filterName]: filterValue }),
        page: 1,
      },
    }
  },
  [SET_FILTERS]: (state: State, { payload: { tableName, filters } }: SetFiltersReturnType) => {
    const config = state[tableName]
    return {
      ...state,
      [tableName]: { ...config, filters, page: 1 },
    }
  },
  [CHANGE_PAGE]: (state: State, { payload: { tableName, pageNumber, pageSize } }: ChangePageReturnType) => (
    {
      ...state,
      ...{ [tableName]: { ...state[tableName], page: pageNumber, pageSize } },
    }

  ),
  [CHANGE_SORT]: (state: State, { payload: { tableName, columnName, order } }: ChangeSortReturnType) => (
    updateIn(
      state,
      [tableName, 'sort'],
      () => ({
        columnName,
        order,
      }),
    )
  ),
  [REMOVE_SORT]: (state: State, { payload: { tableName } }: RemoveFilterReturnType) => (
    updateIn(
      state,
      [tableName, 'sort'],
      () => ({
        columnName: undefined,
        order: undefined,
      }),
    )
  ),
  [REMOVE_FILTER]: (state: State, { payload: { tableName, filterName } }: RemoveFilterReturnType) => (
    updateIn(
      state,
      [tableName, 'filters'],
      filters => (_.omit(filters, [filterName])),
    )
  ),
  [REMOVE_ALL_FILTERS]: (state: State, { payload: { tableName } }: RemoveAllFiltersReturnType) => (
    updateIn(
      state,
      [tableName, 'filters'],
      () => ({}),
    )
  ),
}

const reducer = createReducer(HANDLERS, {})

export default reducer
