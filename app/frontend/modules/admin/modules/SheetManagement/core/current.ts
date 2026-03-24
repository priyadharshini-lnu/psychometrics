import lodashGet from 'lodash/get'
import * as t from 'io-ts'


import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  SheetTR,
  ColumnTR,
  SheetType,
} from '~/modules/admin/modules/SheetManagement/core/list'
import { createReducer } from '~/utils/redux'

const ParentResourceTypeTR = t.keyof({ project: null, new_campaign: null })
export type ParentResourceType = t.TypeOf<typeof ParentResourceTypeTR>

const SheetDetailTR = t.type({
  type: ParentResourceTypeTR,
  record: SheetTR,
  columns: t.array(ColumnTR),
})
export type SheetDetail = t.TypeOf<typeof SheetDetailTR>

export const FETCH_SINGLE = 'sheetManagement/FETCH_SINGLE_SHEET'

const FetchSingleResponseTR = t.array(SheetDetailTR)
export type FetchSingleResponse = t.TypeOf<typeof FetchSingleResponseTR>

export const fetchSingle = (
  parentType: ParentResourceType,
  parentId: number,
  type: SheetType,
  sheetRowId: string,
): ApiAction<FetchSingleResponse> => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    debounce: 500,
    loader: true,
    camelize: false,
    typedResponse: FetchSingleResponseTR,
    url: `/administration/${parentType}s/${parentId}/sheet_rows/${sheetRowId}`,
    body: { type },
  },
})

export type FetchAction = ApiActionResponse<FetchSingleResponse>

const HANDLERS = {
  [FETCH_SINGLE]: (_: SheetDetail[], { response }: FetchAction) => response,
}

const defaultState: SheetDetail[] = []

export default createReducer(HANDLERS, defaultState)

export const getCurrent = (state: RootState): SheetDetail[] => lodashGet(state, ['sheet', 'current'])
