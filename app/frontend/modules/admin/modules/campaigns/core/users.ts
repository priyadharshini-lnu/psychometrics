import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'
import { AnyAction } from 'redux'

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
export const getCurrent = (state): UserDetails => _.get(get(state), ['current'])

export const FETCH = 'campaigns/FETCH_USERS'
export const CREATE = 'resource/campaigns/user/CREATE'
export const UPDATE = 'resource/campaigns/user/UPDATE'
export const FETCH_SINGLE = 'campaigns/users/FETCH_SINGLE'
export const REMOVE = 'campaigns/user/REMOVE'
export const TOGGLE_STATUS = 'campaigns/user/TOGGLE_STATUS'
export const RESET_PASSWORD = 'campaigns/user/RESET_PASSWORD'

export const fetch = (campaignId: string, tableConfig: TableConfig) => ({
  type: FETCH,
  request: {
    method: 'get',
    debounce: 500,
    tableConfig,
    url: `/administration/new_campaigns/${campaignId}/users`,
  },
})

export const fetchSingle = (campaignId: number, id: number) => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/users/${id}`,
  },
})

export const remove = (campaignId: string, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/users/${id}`,
  },
})

export const toggleStatus = (campaignId: string, id: number, value: boolean, body) => ({
  type: TOGGLE_STATUS,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/users/${id}/toggle_status`,
    body: { ...body, id, value },
  },
})

export const resetPassword = (campaignId: string, id: number) => ({
  type: RESET_PASSWORD,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/users/${id}/reset_password`,
  },
})

export interface UpdateAction {
  response: {
    active: boolean
  },
  requestAction: {
    request: {
      body: {
        id: number
        value: boolean
      }
    }
  }
}

export interface FetchAction {
  response: {
    list: []
    total: 0
  }
}

export interface UserDetails {
  id: number
  fullName: string
  email: string
  disabled: boolean
  campaigns: { id: number, name: string }[]
  createdAt: string
  lastSignInAt: string
}

export interface State {
  list: User[]
  total: number
  current: UserDetails
}

const HANDLERS = {
  [FETCH]: (_, { response }: FetchAction) => response,
  [FETCH_SINGLE]: (_state, { response }: AnyAction) => (
    { current: _.omit(response, ['userAssessments', 'userReport']) }),
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
  [TOGGLE_STATUS]: (state, { response, requestAction: { request } }: UpdateAction) => {
    const users = state.list.map((user: User) => {
      if (user.id !== request.body.id) return user

      return { ...user, ...response }
    })
    return setIn(state, ['list'], users)
  },
}

export default createReducer(HANDLERS, defaultState)
