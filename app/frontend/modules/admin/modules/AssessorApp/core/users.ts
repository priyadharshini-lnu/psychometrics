import _ from 'lodash'
import { createReducer } from 'utils/redux'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'

const UserTR = t.type({
  id: t.number,
  fullName: t.string,
  email: t.string,
})

const UserListResponseTR = t.type({
  list: t.array(UserTR),
  total: t.number,
})

export type User = t.TypeOf<typeof UserTR>
export type State = t.TypeOf<typeof UserListResponseTR>

const defaultState: State = { list: [], total: 0 }

export const get = (state: RootState): State => _.get(state, ['assessors', 'users'])

export const FETCH = 'assessors/users/FETCH'

export const fetch = (campaignId: number, tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${campaignId}/users`,
    debounce: 500,
    tableConfig,
    typedResponse: UserListResponseTR,
  },
})

const HANDLERS = {
  [FETCH]: (_: State, { response }: ApiActionResponse<State>) => response,
}

export default createReducer(HANDLERS, defaultState)
