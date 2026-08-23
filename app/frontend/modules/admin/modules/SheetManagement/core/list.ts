import lodashGet from 'lodash/get'
import * as t from 'io-ts'


import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'
import { ParentResourceType } from '~/modules/admin/modules/SheetManagement/core/current'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { createReducer } from '~/utils/redux'

export enum SheetType {
  Datasheet = 'Datasheet',
  Accesssheet = 'Accesssheet'
}

export const EMAIL = 'Email'

export interface SheetIdentity {
  parentType: ParentResourceType
  parentId: number
  sheetType: SheetType
}

export const sheetKey = ({ parentType, parentId, sheetType }: SheetIdentity): string => (
  `${parentType}:${parentId}:${sheetType}`
)

export interface SheetKeyed {
  requestAction: { sheetKey: string }
}

export const SheetTR = t.intersection([
  t.record(t.string, t.union([t.string, t.number, t.null])),
  t.type({
    id: t.number,
  }),
])
export type Sheet = t.TypeOf<typeof SheetTR>

export const ColumnTypeTR = t.keyof({
  string: null,
  number: null,
  text: null,
  html: null,
  markdown: null,
})

export type ColumnType = t.TypeOf<typeof ColumnTypeTR>

export const ColumnTR = t.type({
  id: t.number,
  position: t.number,
  name: t.string,
  column_type: t.string,
  dashboard_use: t.union([t.boolean, t.undefined]),
  accessor_access: t.union([t.boolean, t.undefined]),
  visible_in_list: t.boolean,
})

export interface Column {
  id: number
  position: number
  name: string | null
  dashboardUse?: boolean
  accessorAccess?: boolean
  visibleInList: boolean
  columnType: ColumnType
}

const FetchResponseTR = t.type({
  total: t.number,
  permissions: t.type({
    export: t.boolean,
    import: t.boolean,
    update: t.boolean,
    add: t.boolean,
    delete: t.boolean,
    view: t.boolean,
    edit: t.boolean,
  }),
  columns: t.array(ColumnTR),
  list: t.array(SheetTR),
})
export type FetchResponse = t.TypeOf<typeof FetchResponseTR>

export const FETCH = 'sheetManagement/FETCH_SHEET'

export const fetch = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  tableConfig: TableConfig,
): ApiAction<FetchResponse> => ({
  type: FETCH,
  sheetKey: sheetKey({ parentType, parentId, sheetType: type }),
  request: {
    method: 'get',
    loader: true,
    camelize: false,
    tableConfig,
    typedResponse: FetchResponseTR,
    url: `/administration/${parentType}s/${parentId}/sheet_rows`,
    body: { type },
  },
})

export type FetchAction = ApiActionResponse<{
  total: number
  list: Sheet[]
  columns: Column[]
  permissions: {
    export: boolean
    import: boolean
    update: boolean
    add: boolean
    delete: boolean
    view: boolean
    edit: boolean
  }
}> & SheetKeyed

export type AddResponse = t.TypeOf<typeof SheetTR>

export const ADD = 'sheetManagement/ADD_SHEET_RECORD'

export const add = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  record: Partial<Sheet>,
): ApiAction<AddResponse> => ({
  type: ADD,
  request: {
    body: { type, ...record },
    method: 'post',
    loader: true,
    decamelize: false,
    camelize: false,
    typedResponse: SheetTR,
    url: `/administration/${parentType}s/${parentId}/sheet_rows`,
  },
})

export type AddAction = ApiActionResponse<AddResponse>

export type UpdateResponse = t.TypeOf<typeof SheetTR>

export const UPDATE = 'sheetManagement/UPDATE_SHEET_RECORD'

export const update = (
  id: string,
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  record: Partial<Sheet>,
): ApiAction<UpdateResponse> => ({
  type: UPDATE,
  request: {
    body: { type, ...record },
    method: 'put',
    loader: true,
    decamelize: false,
    camelize: false,
    typedResponse: SheetTR,
    url: `/administration/${parentType}s/${parentId}/sheet_rows/${id}`,
  },
})

export type UpdateAction = ApiActionResponse<UpdateResponse>

export const BULK_DELETE = 'sheetManagement/BULK_DELETE_SHEET_RECORDS'

export const bulkDelete = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  recordIds: string[],
) => ({
  type: BULK_DELETE,
  request: {
    method: 'delete',
    body: { ids: recordIds, type },
    loader: true,
    url: `/administration/${parentType}s/${parentId}/sheet_rows/bulk_delete`,
  },
})

export const IMPORT = 'sheetManagement/IMPORT'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const importSheet = (parentType: ParentResourceType, parentId: number, type: SheetType, body: any) => ({
  type: IMPORT,
  request: {
    method: 'put',
    url: `/administration/${parentType}s/${parentId}/sheet_rows/import.json?type=${type}`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})


export interface State {
  key: string
  rows: Sheet[]
}

const HANDLERS = {
  [FETCH]: (_: State, { response, requestAction }: FetchAction): State => (
    { key: requestAction.sheetKey, rows: response.list }
  ),
  [ADD]: (state: State, { response }: AddAction): State => ({ ...state, rows: [response, ...state.rows] }),
  [UPDATE]: (state: State, { response }: UpdateAction): State => ({
    ...state,
    rows: state.rows.map((record) => {
      if (record.id === response.id) {
        return response
      }
      return record
    }),
  }),
}

const defaultState: State = { key: '', rows: [] }

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState, sheet: SheetIdentity): Sheet[] => {
  const { key, rows }: State = lodashGet(state, ['sheet', 'list'])

  return key === sheetKey(sheet) ? rows : defaultState.rows
}
