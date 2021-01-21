import lodashGet from 'lodash/get'
import * as t from 'io-ts'

import { createReducer } from 'utils/redux'

import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from 'modules/admin/core/rootReducers'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/core/current'

export const DataSheetTR = t.intersection([
  t.record(t.string, t.union([t.string, t.number])),
  t.type({
    id: t.string,
    email: t.string,
  }),
])
export type DataSheet = t.TypeOf<typeof DataSheetTR>

const ColumnTypeTR = t.keyof({
  string: null,
  numeric: null,
  text: null,
  html: null,
  markdown: null,
})
export type ColumnType = t.TypeOf<typeof ColumnTypeTR>

export const ColumnTR = t.type({
  id: t.string,
  type: ColumnTypeTR,
})
export type Column = t.TypeOf<typeof ColumnTR>

const FetchResponseTR = t.type({
  total: t.number,
  columns: t.array(ColumnTR),
  list: t.array(DataSheetTR),
})
export type FetchResponse = t.TypeOf<typeof FetchResponseTR>

export const FETCH = 'datasheetManagement/FETCH_DATASHEET'

export const fetch = (
  parentType: ParentResourceType,
  parentId: number,
): ApiAction<FetchResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    mocked: true,
    loader: true,
    camelize: false,
    typedResponse: FetchResponseTR,
    url: `/administration/${parentType}s/${parentId}/datasheets`,
  },
})

export type FetchAction = ApiActionResponse<{
  total: number
  list: DataSheet[]
  columns: Column[]
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
    mocked: true,
    loader: true,
    camelize: false,
    typedResponse: DataSheetTR,
    url: `/administration/${parentType}s/${parentId}/datasheets`,
  },
})

export type AddAction = ApiActionResponse<AddResponse>

export type UpdateResponse = t.TypeOf<typeof DataSheetTR>

export const UPDATE = 'datasheetManagement/UPDATE_DATASHEET_RECORD'

export const update = (
  parentType: ParentResourceType,
  parentId: number,
  record: Partial<DataSheet>,
): ApiAction<UpdateResponse> => ({
  type: UPDATE,
  request: {
    body: record,
    method: 'put',
    mocked: true,
    loader: true,
    camelize: false,
    typedResponse: DataSheetTR,
    url: `/administration/${parentType}s/${parentId}/datasheets`,
  },
})

export type UpdateAction = ApiActionResponse<UpdateResponse>

export const BatchDeleteResponseTR = t.type({ success: t.string })
export type BatchDeleteResponse = t.TypeOf<typeof BatchDeleteResponseTR>

export const BATCH_DELETE = 'datasheetManagement/BATCH_DELETE_DATASHEET_RECORDS'

export const batchDelete = (
  parentType: ParentResourceType,
  parentId: number,
  recordIds: string[],
): ApiAction<BatchDeleteResponse> => ({
  type: BATCH_DELETE,
  request: {
    method: 'delete',
    body: recordIds,
    mocked: true,
    loader: true,
    camelize: false,
    typedResponse: BatchDeleteResponseTR,
    url: `/administration/${parentType}s/${parentId}/datasheets/`,
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
  [BATCH_DELETE]: (state: State) => state,
}

const defaultState: State = []

export default createReducer(HANDLERS, defaultState)

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'list'])
