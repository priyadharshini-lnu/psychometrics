import lodashGet from 'lodash/get'
import humps from 'humps'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/core/current'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'
import {
  FETCH, FetchAction, Column, ColumnTypeTR, SheetType, SheetIdentity, SheetKeyed, sheetKey,
} from './list'

export interface State {
  key: string
  columns: Column[]
}

export const ColumnTR = t.type({
  id: t.number,
  position: t.number,
  name: t.union([t.string, t.null]),
  columnType: ColumnTypeTR,
  dashboardUse: t.union([t.boolean, t.undefined]),
  accessorAccess: t.union([t.boolean, t.undefined]),
  visibleInList: t.boolean,
})

export const MAX_LENGTH_FOR_DASHBOARD_USE = 64

export const FETCH_COLUMNS = 'sheetManagement/FETCH_COLUMNS'
export const CHANGE_COLUMN_ATTRS = 'sheetManagement/CHANGE_COLUMN_ATTRS'
export const REMOVE_COLUMNS = 'sheetManagement/REMOVE_COLUMNS'
export const SAVE_COLUMN = 'sheetManagement/SAVE_COLUMN'
export const UPDATE_COLUMN = 'sheetManagement/UPDATE_COLUMN'
export const UPDATE_SORTING = 'sheetManagement/UPDATE_SORTING'

const ColumnsResponseTR = t.array(ColumnTR)
export type ColumnsResponse = t.TypeOf<typeof ColumnsResponseTR>
export type FetchColumnAction = ApiActionResponse<ColumnsResponse> & SheetKeyed
export type AddColumnAction = ApiActionResponse<ColumnsResponse>
export type UpdateColumnAction = ApiActionResponse<ColumnsResponse>
export type DeleteColumnAction = ApiActionResponse<ColumnsResponse>
export type AddColumnErrorAction = ApiActionResponse<string[]>

export const datasheetIdentity = (campaignId: number): SheetIdentity => ({
  parentType: 'new_campaign',
  parentId: campaignId,
  sheetType: SheetType.Datasheet,
})

export const fetch = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
) => ({
  type: FETCH_COLUMNS,
  sheetKey: sheetKey({ parentType, parentId, sheetType: type }),
  request: {
    typedResponse: ColumnsResponseTR,
    method: 'get',
    body: { type },
    url: `/administration/${parentType}s/${parentId}/sheets/get_columns`,
  },
})

export const fetchDatasheetColumns = (campaignId: number) => ({
  type: FETCH_COLUMNS,
  sheetKey: sheetKey(datasheetIdentity(campaignId)),
  request: {
    typedResponse: ColumnsResponseTR,
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/sheets/datasheet_columns`,
  },
})

export const saveColumn = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  column: Column,
) => ({
  type: SAVE_COLUMN,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'post',
    body: { column, type },
    url: `/administration/${parentType}s/${parentId}/sheets/add_column`,
  },
})

export const updateColumn = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  column: Column,
) => ({
  type: UPDATE_COLUMN,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'put',
    body: { column, type },
    url: `/administration/${parentType}s/${parentId}/sheets/update_column`,
  },
})


export const updateSorting = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  columns: Column[],
) => ({
  type: UPDATE_COLUMN,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'put',
    body: { columns, type },
    url: `/administration/${parentType}s/${parentId}/sheets/update_columns_order`,
  },
})

export const removeColumns = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  columns: string[],
) => ({
  type: REMOVE_COLUMNS,

  request: {
    typedResponse: ColumnsResponseTR,
    method: 'delete',
    body: { column_ids: columns, type },
    url: `/administration/${parentType}s/${parentId}/sheets/remove_columns`,
  },
})

const HANDLERS = {
  [FETCH]: (state: State, { response, requestAction }: FetchAction): State => (
    { key: requestAction.sheetKey, columns: humps.camelizeKeys(response.columns) }
  ),
  [FETCH_COLUMNS]: (state: State, { response, requestAction }: FetchColumnAction): State => (
    { key: requestAction.sheetKey, columns: response }
  ),
  [SAVE_COLUMN]: (state: State, { response }: AddColumnAction): State => ({ ...state, columns: response }),
  [UPDATE_COLUMN]: (state: State, { response }: UpdateColumnAction): State => ({ ...state, columns: response }),
  [UPDATE_SORTING]: (state: State, { response }: UpdateColumnAction): State => ({ ...state, columns: response }),
  [REMOVE_COLUMNS]: (state: State, { response }: DeleteColumnAction): State => ({ ...state, columns: response }),
}

const defaultState: State = { key: '', columns: [] }

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState, sheet: SheetIdentity): Column[] => {
  const { key, columns }: State = lodashGet(state, ['sheet', 'columnDefinitions'])

  return key === sheetKey(sheet) ? columns : defaultState.columns
}
export const getVisibleColumnNames = (state: RootState, sheet: SheetIdentity) => (
  get(state, sheet).filter(column => column.visibleInList).map(c => c.name)
)
export const getColumns = (state: RootState, sheet: SheetIdentity) => get(state, sheet)
