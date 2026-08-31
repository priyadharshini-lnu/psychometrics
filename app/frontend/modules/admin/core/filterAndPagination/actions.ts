import { FilterValue } from 'antd/es/table/interface'
import { TableConfig } from './interfaces'

export const INIT_TABLE = 'INIT_TABLE'
export const CHANGE_FILTER = 'modules/admin/CHANGE_FILTER'
export const CHANGE_PAGE = 'modules/admin/CHANGE_PAGE'
export const REMOVE_FILTER = 'modules/admin/REMOVE_FILTER'
export const REMOVE_ALL_FILTERS = 'modules/admin/REMOVE_ALL_FILTERS'
export const SET_FILTERS = 'modules/admin/SET_FILTERS'
export const CHANGE_SORT = 'modules/admin/CHANGE_SORT'
export const REMOVE_SORT = 'modules/admin/REMOVE_SORT'
export const SET_TABLE_CONFIG = 'modules/admin/SET_TABLE_CONFIG'

export const initTable = (tableName: string, maintainHistory = false, pageSize: number) => ({
  type: INIT_TABLE,
  payload: { tableName, maintainHistory, pageSize },
})

export const changeFilter = (
  tableName: string, filterName: string, filterValue: React.Key | boolean | FilterValue,
) => ({
  type: CHANGE_FILTER,
  payload: { tableName, filterName, filterValue },
})

// The whole filter set in one write, so a span held under two keys lands together and a replay is atomic.
export const setFilters = (tableName: string, filters: TableConfig['filters']) => ({
  type: SET_FILTERS,
  payload: { tableName, filters },
})

export const removeFilter = (tableName: string, filterName: string) => ({
  type: REMOVE_FILTER,
  payload: { tableName, filterName },
})

export const removeAllFilters = (tableName: string) => ({
  type: REMOVE_ALL_FILTERS,
  payload: { tableName },
})

export const changePage = (tableName: string, pageNumber: number, pageSize?: number) => ({
  type: CHANGE_PAGE,
  payload: { tableName, pageNumber, pageSize },
})

export const changeSort = (tableName: string, columnName: string, order: string) => ({
  type: CHANGE_SORT,
  payload: { tableName, columnName, order },
})

export const removeSort = (tableName: string) => ({
  type: REMOVE_SORT,
  payload: { tableName },
})

export const setTableConfigFromUrl = (tableConfig: TableConfig) => ({
  type: SET_TABLE_CONFIG,
  payload: { tableConfig },
})

export type changeFilterType = typeof changeFilter
export type setFiltersType = typeof setFilters
export type removeFilterType = typeof removeFilter
export type removeAllFiltersType = typeof removeAllFilters
export type changePageType = typeof changePage
export type changeSortType = typeof changeSort
export type removeSortType = typeof removeSort
export type initTableType = typeof initTable
export const setTableConfigFromUrlType = typeof setTableConfigFromUrl

export type InitTableReturnType = ReturnType<typeof initTable>
export type ChangeFilterReturnType = ReturnType<typeof changeFilter>
export type SetFiltersReturnType = ReturnType<typeof setFilters>
export type ChangeSortReturnType = ReturnType<typeof changeSort>
export type RemoveSortReturnType = ReturnType<typeof removeSort>
export type RemoveFilterReturnType = ReturnType<typeof removeFilter>
export type RemoveAllFiltersReturnType = ReturnType<typeof removeAllFilters>
export type ChangePageReturnType = ReturnType<typeof changePage>
export type SetTableConfigFromUrlType = ReturnType<typeof setTableConfigFromUrl>
export type ActionsReturnType = ChangeFilterReturnType | ChangeSortReturnType |
  RemoveFilterReturnType | ChangePageReturnType
