import lodashGet from 'lodash/get'
import humps from 'humps'
import { createReducer } from 'utils/redux'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/core/current'
import { RootState } from 'modules/admin/core/rootReducers'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import {
  FETCH, FetchAction, Column, ColumnTypeTR,
} from './list'

export type State = Column[]

export const ColumnTR = t.type({
  name: t.string,
  type: ColumnTypeTR,
  dashboardUse: t.boolean,
  accessorAccess: t.boolean,
  visibleInList: t.boolean,
})

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'columnDefinitions'])
export const getVisibleColumnNames = (state: RootState) => (
  get(state).filter(column => column.visibleInList).map(c => c.name)
)
export const getColumns = (state: RootState) => get(state)

export const CHANGE_COLUMN_ATTRS = 'datasheetManagement/CHANGE_COLUMN_ATTRS'
export const REMOVE_COLUMNS = 'datasheetManagement/REMOVE_COLUMNS'
export const SAVE_COLUMN = 'datasheetManagement/SAVE_COLUMN'
export const UPDATE_COLUMN = 'datasheetManagement/UPDATE_COLUMN'
export const UPDATE_SORTING = 'datasheetManagement/UPDATE_SORTING'

const ColumnsResponseTR = t.array(ColumnTR)
export type ColumnsResponse = t.TypeOf<typeof ColumnsResponseTR>
export type AddColumnAction = ApiActionResponse<ColumnsResponse>
export type UpdateColumnAction = ApiActionResponse<ColumnsResponse>
export type DeleteColumnAction = ApiActionResponse<ColumnsResponse>
export type AddColumnErrorAction = ApiActionResponse<string[]>

export const saveColumn = (
  parentType: ParentResourceType,
  parentId: number,
  column: Column,
) => ({
  type: SAVE_COLUMN,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'post',
    body: { column },
    url: `/administration/${parentType}s/${parentId}/datasheets/add_column`,
  },
})

export const updateColumn = (
  parentType: ParentResourceType,
  parentId: number,
  column: Column,
) => ({
  type: UPDATE_COLUMN,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'put',
    body: { column },
    url: `/administration/${parentType}s/${parentId}/datasheets/update_column`,
  },
})


export const updateSorting = (
  parentType: ParentResourceType,
  parentId: number,
  columns: Column[],
) => ({
  type: UPDATE_COLUMN,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'put',
    body: { columns },
    url: `/administration/${parentType}s/${parentId}/datasheets/update_columns_order`,
  },
})

export const removeColumns = (
  parentType: ParentResourceType,
  parentId: number,
  columns: string[],
) => ({
  type: REMOVE_COLUMNS,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'delete',
    body: { columns },
    url: `/administration/${parentType}s/${parentId}/datasheets/remove_columns`,
  },
})

const HANDLERS = {
  [FETCH]: (state: State, { response }: FetchAction) => humps.camelizeKeys(response.columns),
  [SAVE_COLUMN]: (state: State, { response }: AddColumnAction) => response,
  [UPDATE_COLUMN]: (state: State, { response }: UpdateColumnAction) => response,
  [UPDATE_SORTING]: (state: State, { response }: UpdateColumnAction) => response,
  [REMOVE_COLUMNS]: (state: State, { response }: DeleteColumnAction) => response,
}

const defaultState: State = []

export default createReducer(HANDLERS, defaultState)
