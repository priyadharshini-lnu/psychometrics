import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

const defaultState = {
  list: [],
  total: 0,
}

export const get = (state): User[] => _.get(state, ['campaigns', 'users'])

export const FETCH = 'campaigns/FETCH_USERS'
export const CREATE = 'resource/campaigns/user/CREATE'
export const UPDATE = 'resource/campaigns/user/UPDATE'

export const fetch = (projectId: string, campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/users`,
  },
})


export interface FetchAction {
  response: {
    list: []
    total: 0
  }
}
export interface State {
  list: User[]
  total: number
}

const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => response,
  [CREATE]: (state: State, { response }: { response: User }) => (setIn(state, ['list'], [response, ...state.list])),
  [UPDATE]: (state: State, { response }: { response: User }) => (
    updateIn(state, ['list'], (users: User[]) => _.map(users, (user: User) => {
      if (user.id === response.id) { return response }

      return user
    }))
  ),
}

export default createReducer(HANDLERS, defaultState)
