import lodashGet from 'lodash/get'
import * as t from 'io-ts'

import { createReducer } from 'utils/redux'

import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from 'modules/admin/core/rootReducers'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/core/current'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'

export const DataSheetTR = t.intersection([
  t.record(t.string, t.union([t.string, t.number, t.null])),
  t.type({
    id: t.number,
    Email: t.string,
  }),
])
export type DataSheet = t.TypeOf<typeof DataSheetTR>

const ColumnTypeTR = t.keyof({
  String: null,
  Number: null,
  Text: null,
  HTML: null,
  Markdown: null,
})
export type ColumnType = t.TypeOf<typeof ColumnTypeTR>

export const ColumnTR = t.type({
  id: t.string,
  type: ColumnTypeTR,
  visible: t.boolean,
})
export type Column = t.TypeOf<typeof ColumnTR>

const FetchResponseTR = t.type({
  total: t.number,
  permissions: t.type({
    export: t.boolean,
    import: t.boolean,
    update: t.boolean,
    add: t.boolean,
    delete: t.boolean,
  }),
  columns: t.array(ColumnTR),
  list: t.array(DataSheetTR),
})
export type FetchResponse = t.TypeOf<typeof FetchResponseTR>

export const FETCH = 'datasheetManagement/FETCH_DATASHEET'

export const fetch = (
  parentType: ParentResourceType,
  parentId: number,
  tableConfig: TableConfig,
): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    loader: true,
    camelize: false,
    tableConfig,
    typedResponse: FetchResponseTR,
    url: `/administration/${parentType}s/${parentId}/datasheet_rows`,
  },
})

export type FetchAction = ApiActionResponse<{
  total: number
  list: DataSheet[]
  columns: Column[]
  permissions: {
    export: boolean
    import: boolean
    update: boolean
    add: boolean
    delete: boolean
  }
}>

export type AddResponse = t.TypeOf<typeof DataSheetTR>

export const ADD = 'datasheetManagement/ADD_DATASHEET_RECORD'

export const add = (
  parentType: ParentResourceType,
  parentId: number,
  record: Partial<DataSheet>,
): ApiAction<AddResponse> => ({
  type: ADD,
  request: {
    body: record,
    method: 'post',
    loader: true,
    decamelize: false,
    camelize: false,
    typedResponse: DataSheetTR,
    url: `/administration/${parentType}s/${parentId}/datasheet_rows`,
  },
})

export type AddAction = ApiActionResponse<AddResponse>

export type UpdateResponse = t.TypeOf<typeof DataSheetTR>

export const UPDATE = 'datasheetManagement/UPDATE_DATASHEET_RECORD'

export const update = (
  id: string,
  parentType: ParentResourceType,
  parentId: number,
  record: Partial<DataSheet>,
): ApiAction<UpdateResponse> => ({
  type: UPDATE,
  request: {
    body: record,
    method: 'put',
    loader: true,
    decamelize: false,
    camelize: false,
    typedResponse: DataSheetTR,
    url: `/administration/${parentType}s/${parentId}/datasheet_rows/${id}`,
  },
})

export type UpdateAction = ApiActionResponse<UpdateResponse>

export const BULK_DELETE = 'datasheetManagement/BULK_DELETE_DATASHEET_RECORDS'

export const bulkDelete = (
  parentType: ParentResourceType,
  parentId: number,
  recordIds: string[],
) => ({
  type: BULK_DELETE,
  request: {
    method: 'delete',
    body: { ids: recordIds },
    loader: true,
    url: `/administration/${parentType}s/${parentId}/datasheet_rows/bulk_delete`,
  },
})

export const IMPORT = 'datasheetManagement/IMPORT'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const importDatasheet = (parentType: ParentResourceType, parentId: number, body: any) => ({
  type: IMPORT,
  request: {
    method: 'put',
    url: `/administration/${parentType}s/${parentId}/datasheet_rows/import`,
    body,
    loader: true,
  },
})


export type State = DataSheet[]

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchAction) => response.list,
  [ADD]: (state: State, { response }: AddAction) => [response, ...state],
  [UPDATE]: (state: State, { response }: UpdateAction) => state.map((record) => {
    if (record.id === response.id) {
      return response
    }
    return record
  }),
}

const defaultState: State = []

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'list'])
