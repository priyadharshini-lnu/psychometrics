import _ from 'lodash'
import { createReducer } from 'utils/redux'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'

const DataSheetTR = t.type({
  email: t.string,
  firstName: t.string,
})

const ListResponseTR = t.type({
  datasheet: t.array(DataSheetTR),
  total: t.number,
})

export type DataSheet = t.TypeOf<typeof DataSheetTR>
export type ListResponse = t.TypeOf<typeof ListResponseTR>
export type State = DataSheet[]

const defaultState: State = []

export const get = (state: RootState): State => _.get(state, ['datasheet', 'list'])

export const FETCH = 'datasheetManagement/FETCH_DATASHEET'

export const fetch = (parentType: string, parentId: number): ApiAction<ListResponse> => ({
  type: FETCH,
  request: {
    method: 'get',
    mocked: true,
    debounce: 500,
    typedResponse: ListResponseTR,
    url: `/administration/${parentType}s/${parentId}/datasheets`,
  },
})

export type FetchAction = ApiActionResponse<{ total: number, datasheet: DataSheet[] }>


const HANDLERS = {
  [FETCH]: (_: DataSheet[], { response }: FetchAction) => response.datasheet,
}

export default createReducer(HANDLERS, defaultState)
