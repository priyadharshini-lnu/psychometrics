import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import ApiAction from 'interfaces/ApiAction'
import { takeEvery, put } from 'redux-saga/effects'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import UserReport from '~/modules/admin/modules/campaigns/interfaces/UserReport'
import { setIn, updateIn } from '~/utils/immutable'
import { createReducer, CustomAction } from '~/utils/redux'

export const DEFAULT_PAGE_SIZE = 25

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
  permissions: {
    create: false,
    exportUsers: false,
    exportCompletionStatus: false,
    import: false,
    edit: false,
    exportSignInUrl: false,
  },
}

export const get = (state): User[] => _.get(state, ['campaigns', 'users'])
export const getCurrent = (state): UserDetails => _.get(get(state), ['current'])

export const FETCH = 'campaigns/FETCH_USERS'
export const CREATE = 'resource/campaigns/user/CREATE'
export const UPDATE = 'resource/campaigns/user/UPDATE'
export const FETCH_SINGLE = 'campaigns/users/FETCH_SINGLE'
export const IMPORT = 'campaigns/users/IMPORT'
export const REMOVE = 'campaigns/user/REMOVE'
export const TOGGLE_ACTIVE = 'campaigns/user/TOGGLE_ACTIVE'
export const TOGGLE_ACTIVE_REQUEST = 'campaigns/user/TOGGLE_ACTIVE_REQUEST'
export const RESET_PASSWORD = 'campaigns/user/RESET_PASSWORD'
export const EXTEND_TIME = 'campaigns/user/EXTEND_TIME'
export const SET_USER_DETAILS = 'campaigns/users/SET_USER_DETAILS'
export const RESET_ASSESSMENT = 'campaigns/userAssessments/RESET'
export const REMOVE_ASSESSMENT = 'campaigns/userAssessments/REMOVE'
export const EXTEND_ASSESSMENT_TIME = 'campaigns/userAssessments/EXTEND_ASSESSMENT_TIME'
export const CREATE_REPORT = 'resource/userReport/report/CREATE'
export const REMOVE_REPORT = 'resource/campaigns/report/REMOVE'
export const EXPORT_COMPLETION_STATUSES = 'resource/campaigns/users/EXPORT_COMPLETION_STATUSES'
export const EXPORT_COMPACT_COMPLETION_STATUSES = 'resource/campaigns/users/EXPORT_COMPACT_COMPLETION_STATUSES'
export const EXPORT_USERS = 'resource/campaigns/users/EXPORT_USERS'
export const ASSIGN_REPORTS_AND_ASSESSMENTS = 'resource/campaigns/users/ASSIGN_REPORTS_AND_ASSESSMENTS'
export const EXPORT_REPORTS_AND_ASSESSMENTS = 'resource/campaigns/users/EXPORT_REPORTS_AND_ASSESSMENTS'
export const DOWNLOAD_IDP_REPORTS = 'resource/campaigns/users/DOWNLOAD_IDP_REPORTS'
export const ADD_MANAGER = 'users/ADD_MANAGER'
export const CREATE_HOGAN_CREDENTIAL = 'users/CREATE_HOGAN_CREDENTIAL'
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
    loader: true,
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
    contentType: 'multipart/form-data;',
  },
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assignReportsAndAssessments = (campaignId: number, body: any): ApiAction<ShortUser[]> => ({
  type: ASSIGN_REPORTS_AND_ASSESSMENTS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/users/assign_reports_and_assessments`,
    body,
    loader: true,
    contentType: 'multipart/form-data;',
  },
})

export const bulkDownloadIdpReports = (campaignId: number, body: Record<string, string>): ApiAction<ShortUser[]> => ({
  type: DOWNLOAD_IDP_REPORTS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/users/bulk_download_idp_reports`,
    body,
  },
})

export const exportReportsAndAssessments = (campaignId: number): ApiAction<{}> => ({
  type: EXPORT_REPORTS_AND_ASSESSMENTS,
  request: {
    method: 'get',
    url: `/administration/new_campaigns/${campaignId}/users/export_reports_and_assessments`,
  },
})

export const exportCompletionStatuses = (campaignId: number, body = {}): ApiAction<{}> => ({
  type: EXPORT_COMPLETION_STATUSES,
  request: {
    method: 'get',
    body,
    url: `/administration/new_campaigns/${campaignId}/users/export_completion_status`,
  },
})

export const exportCompactCompletionStatuses = (campaignId: number, body = {}): ApiAction<{}> => ({
  type: EXPORT_COMPACT_COMPLETION_STATUSES,
  request: {
    method: 'get',
    body,
    url: `/administration/new_campaigns/${campaignId}/users/export_compact_completion_status`,
  },
})

export const exportUsers = (campaignId: number, body: { exportSignInUrl: boolean }): ApiAction<{}> => ({
  type: EXPORT_USERS,
  request: {
    method: 'get',
    body,
    url: `/administration/new_campaigns/${campaignId}/users/export`,
  },
})
export type ExportUsers = (campaignId: number, data?: { exportSignInUrl: boolean }) => Promise<void>


export const remove = (campaignId: string, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/users/${id}`,
  },
})

export const toggleActive = (campaignId: string, id: number, options: { updateInListing: boolean }) => ({
  type: TOGGLE_ACTIVE,
  id,
  options,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/users/${id}/toggle_status`,
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

export const setUserDetails = (userDetails: UserDetails) => ({
  type: SET_USER_DETAILS,
  userDetails,
})

export const addManager = (projectId: number, UserId: number, managerId: number | null) => ({
  type: ADD_MANAGER,
  request: {
    method: 'put',
    url: `/api/v2/administration/projects/${projectId}/add_manager`,
    body: { UserId, managerId },
  },
})

export const createHoganCredentials = (campaignId: string, UserId: number): ApiAction<{}> => ({
  type: CREATE_HOGAN_CREDENTIAL,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/users/${UserId}/create_hogan_credentials`,
    body: {},
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
  status: string
  additionalTime: number
  startedAt: string
  completedAt: string
  userAssessments: UserAssessment[]
  userReports: UserReport[]
  permissions: {
    addReport: boolean
    regenerateReport: boolean
    toggleStatus: boolean
    remove: boolean
    bulkDownload: boolean
    viewWorkshopDetails: boolean
  }
  manager: {
    id: number | null
    name: string | null
    email: string | null
  }
  hoganId: string | null
  hoganProvider: string | null
}

export interface State {
  list: User[]
  total: number
  permissions: {
    create: boolean
    exportUsers: boolean,
    exportCompletionStatus: boolean,
    exportSignInUrl: boolean,
    import: boolean,
    edit: boolean
  }
  current?: UserDetails
}

type FetchType = ApiActionResponse<{
  list: [],
  total: number,
  permissions: {
    create: boolean,
    exportUsers: boolean,
    exportCompletionStatus: boolean,
    exportSignInUrl: boolean,
    import: boolean,
    edit: boolean
  }
}>

export type AddManagerActionType = ApiActionResponse<{
  data: {
    id: number | null
    attributes: {
      name: string | null
      email: string | null
    }
  }
}>

type FetchSingleType = ApiActionResponse<UserDetails & {
  userAssessments: UserAssessment[],
  userReports: UserReport[],
}>
type CreateType = ApiActionResponse<User>
type UpdateType = ApiActionResponse<User>
type RemoveType = ApiActionResponse<number>
type ToggleStatusType = ApiActionResponse<{ id: number, options: { updateInListing: boolean } }>

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchType) => response,
  [SET_USER_DETAILS]: (state: State, { userDetails }: CustomAction<{ userDetails: UserDetails }>) => (
    { ...state, current: userDetails }
  ),
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
  [TOGGLE_ACTIVE_REQUEST]: (state: State, { id, options }: ToggleStatusType) => {
    if (options.updateInListing) {
      return updateIn(state, ['list'], (users: User[]) => _.map(users, (user: User) => {
        if (user.id !== id) return user

        return { ...user, active: !user.active }
      }))
    }
    return setIn(state, ['current', 'active'], !_.get(state, ['current', 'active']))
  },
  [EXTEND_TIME]: (state: State, { response }: FetchSingleType) => ({
    ...state, current: response,
  }),
  [ADD_MANAGER]: (state: State, { response }: AddManagerActionType) => {
    const { name, email } = response.data.attributes
    const manager = { id: response.data.id, name, email }

    return {
      ...state,
      current: {
        ...state.current,
        manager,
      },
    } as State
  },
}

export default createReducer(HANDLERS, defaultState)

function* genSetUserDetails ({ response }: FetchSingleType) {
  yield put(
    setUserDetails(
      _.omit(response, ['userAssessment']) as UserDetails,
    ),
  )
}

export const watchers = [
  takeEvery(
    [FETCH_SINGLE, CREATE_REPORT, REMOVE_REPORT, EXTEND_ASSESSMENT_TIME, RESET_ASSESSMENT, REMOVE_ASSESSMENT],
    genSetUserDetails,
  ),
]
