import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { updateIn } from 'utils/immutable'
import UserReport from 'modules/admin/modules/campaigns/interfaces/UserReport'
import humps from 'humps'
import { RootState } from 'modules/admin/core/rootReducers'
import { FETCH_SINGLE as FETCH_SINGLE_USER } from './users'

const defaultState = {
  list: [],
  selectedIds: [],
  current: {
    user: {},
    options: { reports: { approval: {} } },
    report: { loaded: false },
    results: { },
  },
}

export const get = (state: RootState): State => _.get(state, ['campaigns', 'userReports'])
export const getCurrent = (state: RootState): UserReportDetails => _.get(get(state), ['current'])
export const getSelectedIds = (state: RootState) => _.get(get(state), 'selectedIds')

export const CREATE = 'resource/userReport/report/CREATE'
export const FETCH_SINGLE = 'userReports/FETCH_SINGLE'
export const DOWNLOAD = 'userReports/DOWNLOAD'
export const SELECT_RECORDS = 'userReports/SELECT_RECORDS'
export const REGENERATE_REPORTS = 'userReports/REGENERATE_REPORTS'
export const REMOVE = 'resource/campaigns/report/REMOVE'

export const fetchSingle = (campaignId: number, id: number) => ({
  type: FETCH_SINGLE,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
    camelize: false,
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

type SelectRecordsAction = ReturnType<typeof selectRecords>

export const remove = (campaignId: number, id: number) => ({
  type: REMOVE,
  request: {
    method: 'delete',
    url: `/administration/new_campaigns/${campaignId}/user_reports/${id}`,
  },
})

export interface FetchAction {
  response: {
    userReports: UserReport[],
  },
}

interface UserReportDetails {
  loaded: boolean
  user: {
    id: number
    email: string
  }
  report: {
    default_language: string,
    name: string,
    locales: object,
  }
  results: object[],
  campaign: object,
}

export interface State {
  list: UserReport[],
  current: UserReportDetails,
  selectedIds: number[]
}

const HANDLERS = {
  [FETCH_SINGLE_USER]: (_, { response }: FetchAction) => ({ list: response.userReports }),
  [FETCH_SINGLE]: (state, action) => ({
    ...state,
    current: {
      ...humps.camelizeKeys(action.response),
      results: action.response.results,
      report: action.response.report,
      user: action.response.user,
      loaded: true,
    },
  }),
  [CREATE]: (_, { response }: FetchAction) => ({ list: response.userReports }),
  [SELECT_RECORDS]: (state: State, { payload: { ids } }: SelectRecordsAction) => ({ ...state, selectedIds: ids }),
  [REGENERATE_REPORTS]: (state: State, { requestAction: { ids } }) => (
    updateIn(state, ['list'],
      (userReports: UserReport[]) => userReports.map((userReport) => {
        if (_.includes(ids, userReport.id)) { return { ...userReport, status: 'generating' } }

        return userReport
      }))
  ),
  [REMOVE]: (state: State, { response }: { response: number }) => (
    updateIn(state, ['list'], (userReports: UserReport[]) => _.filter(
      userReports, (report: UserReport) => report.id !== response,
    ))
  ),
}

export default createReducer(HANDLERS, defaultState)
