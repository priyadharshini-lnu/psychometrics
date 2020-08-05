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
export const REMOVE = 'resource/campaigns/user/REMOVE'
export const TOGGLE_STATUS = 'resource/campaigns/user/TOGGLE_STATUS'

export const fetch = (projectId: string, campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/users`,
  },
})

export const remove = (projectId: string, campaignId: string, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${id}`,
  },
})

export const toggleStatus = (projectId: string, campaignId: string, id: number) => ({
  type: TOGGLE_STATUS,
  request: {
    method: 'patch',
    url: `/administration/projects/${projectId}/new_campaigns/${campaignId}/users/${id}/toggle_status`,
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
  [REMOVE]: (state: State, { response }: { response: number }) => (
    updateIn(state, ['list'], (users: User[]) => _.filter(
      users, (user: User) => user.id !== response,
    ))
  ),
  [TOGGLE_STATUS]: (state: State, { response }: { response: User }) => (
    updateIn(state, ['list'], (users: User[]) => _.map(users, (user: User) => {
      if (user.id === response.id) { return response }

      return user
    }))
  ),
}

export default createReducer(HANDLERS, defaultState)
