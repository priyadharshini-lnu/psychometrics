import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { takeLatest, put, select } from 'redux-saga/effects'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'
import { AnyAction } from 'redux'
import { getTables } from 'modules/admin/core/filterAndPagination/selectors'
import ApiAction from 'interfaces/ApiAction'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  active: boolean
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
export const IMPORT = 'campaigns/users/IMPORT'
export const REMOVE = 'campaigns/user/REMOVE'
export const TOGGLE_STATUS = 'campaigns/user/TOGGLE_STATUS'
export const TOGGLE_STATUS_REQUEST = 'campaigns/user/TOGGLE_STATUS_REQUEST'
export const RESET_PASSWORD = 'campaigns/user/RESET_PASSWORD'


export interface ShortUser {
  firstName: string
  lastName: string
  email: string
}

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


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const importUsers = (campaignId: number, body: any): ApiAction<ShortUser[]> => ({
  type: IMPORT,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/users/import`,
    body,
    loader: true,
  },
})

export const remove = (campaignId: string, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/users/${id}`,
  },
})

export const toggleStatus = (campaignId: string, id: number, options: { updateInListing: boolean }) => ({
  type: TOGGLE_STATUS,
  id,
  options,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/users/${id}/toggle_status`,
  },
})

export const resetPassword = (campaignId: string, id: number) => ({
  type: RESET_PASSWORD,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/users/${id}/reset_password`,
  },
})

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
  active: boolean
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
  [TOGGLE_STATUS_REQUEST]: (state: State, { id, options }: { id: number, options: { updateInListing: boolean } }) => {
    if (options.updateInListing) {
      return updateIn(state, ['list'], (users: User[]) => _.map(users, (user: User) => {
        if (user.id !== id) return user

        return { ...user, active: !user.active }
      }))
    }
    return setIn(state, ['current', 'active'], !state.current.active)
  },
}

export default createReducer(HANDLERS, defaultState)


function* genFetchUsers ({ requestAction }: AnyAction) {
  const tables = yield select(getTables)
  yield put(fetch(requestAction.campaignId, tables.usersList))
}

export const watchers = [
  takeLatest(IMPORT, genFetchUsers),
]
