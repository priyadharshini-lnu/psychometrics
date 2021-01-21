import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { TableConfig } from 'modules/admin/core/filterAndPagination/interfaces'
import { setIn, updateIn } from 'utils/immutable'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  active: boolean
  additionalTime: number | null
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
export const EXTEND_TIME = 'campaigns/user/EXTEND_TIME'

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

export const extendTime = (campaignId: number, id: number, additionalTime: number) => ({
  type: EXTEND_TIME,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/users/${id}/extend_time`,
    body: { additionalTime },
  },
})

export interface UserDetails {
  id: number
  fullName: string
  email: string
  active: boolean
  campaigns: { id: number, name: string, campaignOptions: { fixedTime: boolean } }[]
  createdAt: string
  lastSignInAt: string
  completionStatus: string
  additionalTime: number
  startedAt: string
  completedAt: string
}

export interface State {
  list: User[]
  total: number
  current?: UserDetails
}

type FetchType = ApiActionResponse<{list: [], total: number}>
type FetchSingleType = ApiActionResponse<UserDetails>
type CreateType = ApiActionResponse<User>
type UpdateType = ApiActionResponse<User>
type RemoveType = ApiActionResponse<number>
type ToggleStatusType = ApiActionResponse<{id: number, options: { updateInListing: boolean }}>
type ExtendTimeType = ApiActionResponse<User>

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchType) => response,
  [FETCH_SINGLE]: (state: State, { response }: FetchSingleType) => ({
    ...state, current: response,
  }),
  [CREATE]: (state: State, { response }: CreateType) => (setIn(state, ['list'], [response, ...state.list])),
  [UPDATE]: (state: State, { response }: UpdateType) => (
    updateIn(state, ['list'], (users: User[]) => _.map(users, (user: User) => {
      if (user.id === response.id) { return response }

      return user
    }))
  ),
  [REMOVE]: (state: State, { response }: RemoveType) => (
    updateIn(state, ['list'], (users: User[]) => _.filter(
      users, (user: User) => user.id !== response,
    ))
  ),
  [TOGGLE_STATUS_REQUEST]: (state: State, { id, options }: ToggleStatusType) => {
    if (options.updateInListing) {
      return updateIn(state, ['list'], (users: User[]) => _.map(users, (user: User) => {
        if (user.id !== id) return user

        return { ...user, active: !user.active }
      }))
    }
    return setIn(state, ['current', 'active'], _.get(state, ['current', 'active']))
  },
  // eslint-disable-next-line max-len
  [EXTEND_TIME]: (state: State, { response }: ExtendTimeType) => (setIn(state, ['current', 'additionalTime'], response.additionalTime)),
}

export default createReducer(HANDLERS, defaultState)

export const watchers = [
]
