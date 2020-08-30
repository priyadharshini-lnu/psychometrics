import _ from 'lodash'
import { createReducer } from 'utils/redux'
import UserReport from 'modules/admin/modules/campaigns/interfaces/UserReport'
import humps from 'humps'
import { RootState } from 'modules/admin/core/rootReducers'
import { FETCH_SINGLE as FETCH_SINGLE_USER } from './users'

const defaultState = {
  list: [],
  current: {
    user: {},
    options: { reports: { approval: {} } },
    report: { loaded: false },
    results: { },
  },
}

export const get = (state: RootState): State => _.get(state, ['campaigns', 'userReports'])
export const getCurrent = (state: RootState): UserReportDetails => _.get(get(state), ['current'])

export const CREATE = 'resource/userReport/report/CREATE'
export const FETCH_SINGLE = 'userReports/FETCH_SINGLE'
export const DOWNLOAD = 'userReports/DOWNLOAD'

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
}

export default createReducer(HANDLERS, defaultState)
