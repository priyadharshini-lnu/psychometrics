import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { updateIn } from 'utils/immutable'
import UserReport from 'modules/admin/modules/campaigns/interfaces/UserReport'
import humps from 'humps'
import { RootState } from 'modules/admin/core/rootReducers'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import { FETCH_SINGLE as FETCH_SINGLE_USER } from './users'

interface UserReportDetails {
  loaded?: boolean
  user: {
    id?: number
    email?: string
  }
  report: {
    default_language?: string,
    name?: string,
    locales?: object,
    loaded: boolean
  }
  options: {
    reports: {approval: {}}
  }
  results: object[],
  campaign?: object,
}

export interface State {
  list: UserReport[],
  current: UserReportDetails,
  selectedIds: number[]
}

const defaultState: State = {
  list: [],
  selectedIds: [],
  current: {
    user: { },
    options: { reports: { approval: {} } },
    report: { loaded: false },
    results: [],
  },
}

export const get = (state: RootState): State => state.campaigns.userReports
export const getCurrent = (state: RootState): UserReportDetails => _.get(get(state), ['current'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const CREATE = 'resource/userReport/report/CREATE'
export const FETCH_SINGLE = 'userReports/FETCH_SINGLE'
export const DOWNLOAD = 'userReports/DOWNLOAD'
export const ASYNC_DOWNLOAD = 'userReports/ASYNC_DOWNLOAD'
export const SELECT_RECORDS = 'userReports/SELECT_RECORDS'
export const REGENERATE_REPORTS = 'userReports/REGENERATE_REPORTS'
export const REMOVE = 'resource/campaigns/report/REMOVE'
export const TOGGLE_USER_ACCESS = 'resource/campaigns/report/TOGGLE_USER_ACCESS'
export const TOGGLE_USER_ACCESS_REQUEST = 'resource/campaigns/report/TOGGLE_USER_ACCESS_REQUEST'

export const fetchSingle = (campaignId: number, id: number) => ({
  type: FETCH_SINGLE,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
    camelize: false,
  },
})

export const asyncDownload = (campaignId: number, id: number) => ({
  type: ASYNC_DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/download`,
  },
})

export const download = (campaignId: number, id: number) => ({
  type: DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/download.pdf`,
    responseType: 'blob',
    loader: true,
  },
})

export const selectRecords = (ids: number[]) => ({
  type: SELECT_RECORDS,
  payload: { ids },
})


export const regenerateReports = (campaignId: number, ids: number[]) => ({
  type: REGENERATE_REPORTS,
  ids,
  request: {
    method: 'post',
    url: `/administration/new_campaigns/${campaignId}/user_reports/regenerate`,
    body: { ids },
    loader: true,
  },
})

export const remove = (campaignId: number, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
  },
})

export const toggleUserAccess = (campaignId: number, id: number) => ({
  type: TOGGLE_USER_ACCESS,
  id,
  request: {
    method: 'patch',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}/toggle_user_access`,
  },
})


type FetchType = ApiActionResponse<{userReports: UserReport[]}>
type FetchSingleType = ApiActionResponse<UserReportDetails>
type RemoveType = ApiActionResponse<number>
type RegenerateReports = ApiActionResponse<{}>
type SelectRecordsType = ReturnType<typeof selectRecords>
type ToggleUserAccessType = ApiActionResponse<{id: number}>

const HANDLERS = {
  [FETCH_SINGLE_USER]: (state: State, { response }: FetchType) => ({ ...state, list: response.userReports }),
  [FETCH_SINGLE]: (state: State, action: FetchSingleType) => ({
    ...state,
    current: {
      ...humps.camelizeKeys(action.response),
      results: action.response.results,
      report: action.response.report,
      user: action.response.user,
      loaded: true,
    },
  }),
  [CREATE]: (state: State, { response }: FetchType) => ({ ...state, list: response.userReports }),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsType) => ({ ...state, selectedIds: ids }),
  [REGENERATE_REPORTS]: (state: State, { requestAction: { ids } }: RegenerateReports) => (
    updateIn(state, ['list'],
      (userReports: UserReport[]) => userReports.map((userReport) => {
        if (_.includes(ids, userReport.id)) { return { ...userReport, status: 'generating' } }

        return userReport
      }))
  ),
  [REMOVE]: (state: State, { response }: RemoveType) => (
    updateIn(state, ['list'], (userReports: UserReport[]) => _.filter(
      userReports, (report: UserReport) => report.id !== response,
    ))
  ),
  [TOGGLE_USER_ACCESS_REQUEST]: (state: State, { id }: ToggleUserAccessType) => (
    updateIn(state, ['list'], (userReports: UserReport[]) => _.map(userReports, (userReport: UserReport) => {
      if (userReport.id !== id) return userReport

      return { ...userReport, userAccess: !userReport.userAccess }
    }))
  ),
}

export default createReducer(HANDLERS, defaultState)
