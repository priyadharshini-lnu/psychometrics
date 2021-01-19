/* eslint-disable implicit-arrow-linebreak */
import lodashGet from 'lodash/get'
import * as t from 'io-ts'

import { createReducer } from 'utils/redux'

import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { RootState } from 'modules/admin/core/rootReducers'
import {
  DataSheetTR,
  ColumnTR,
} from 'modules/admin/modules/DatasheetManagement/core/list'

const ParentResourceTypeTR = t.keyof({ project: null, new_campaign: null })
export type ParentResourceType = t.TypeOf<typeof ParentResourceTypeTR>

const DataSheetDetailTR = t.type({
  type: ParentResourceTypeTR,
  record: DataSheetTR,
  columns: t.array(ColumnTR),
})
export type DataSheetDetail = t.TypeOf<typeof DataSheetDetailTR>

export const FETCH_SINGLE = 'datasheetManagement/FETCH_SINGLE_DATASHEET'

const FetchSingleResponseTR = t.array(DataSheetDetailTR)
export type FetchSingleResponse = t.TypeOf<typeof FetchSingleResponseTR>

export const fetchSingle = (
  parentType: ParentResourceType,
  parentId: number,
  datasheetId: string,
): ApiAction<FetchSingleResponse> => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    mocked: true,
    debounce: 500,
    loader: true,
    typedResponse: FetchSingleResponseTR,
    url: `/administration/${parentType}s/${parentId}/datasheets/${datasheetId}`,
  },
})

export type FetchAction = ApiActionResponse<FetchSingleResponse>

const HANDLERS = {
  [FETCH_SINGLE]: (_: DataSheetDetail[], { response }: FetchAction) => response,
}

const defaultState: DataSheetDetail[] = []

export default createReducer(HANDLERS, defaultState)

export const getCurrent = (state: RootState): DataSheetDetail[] => lodashGet(state, ['datasheet', 'current'])
