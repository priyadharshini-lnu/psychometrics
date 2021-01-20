import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'
import humps from 'humps'
import { AnyAction } from 'redux'
import { FetchSingle } from './users'

export const UserReportTR = t.type({
  id: t.number,
  name: t.string,
})
export type UserReport = t.TypeOf<typeof UserReportTR>

export const UserReportDetailTR = t.type({
  user: t.type({
    id: t.union([t.number, t.undefined]),
    email: t.string,
  }),
  report: t.type({
    default_language: t.unknown,
    locales: t.unknown,
    name: t.string,
  }),
  results: t.UnknownRecord,
})

interface UserReportDetail extends t.TypeOf<typeof UserReportDetailTR> {
  loaded: boolean
}

export type State = {
  list: UserReport[],
  current: UserReportDetail,
}

const defaultState: State = {
  list: [],
  current: {
    loaded: false,
    user: { id: undefined, email: '' },
    report: { default_language: null, locales: null, name: '' },
    results: {},
  },
}

export const FETCH_SINGLE = 'assessor/userReports/FETCH_SINGLE'

export const get = (state: RootState): State => _.get(state, ['assessors', 'userReports'])
export const getCurrent = (state: RootState): UserReportDetail => _.get(get(state), ['current'])

const FETCH_SINGLE_USER = 'assessors/users/FETCH_SINGLE'
export const DOWNLOAD = 'assessors/userReports/DOWNLOAD'

export const fetchSingle = (campaignId: number, id: number) => ({
  type: FETCH_SINGLE,
  request: {
    url: `/assessors/campaigns/${campaignId}/user_reports/${id}`,
    camelize: false,
    typedResponse: UserReportDetailTR,
  },
})

export const download = (campaignId: number, id: number) => ({
  type: DOWNLOAD,
  request: {
    url: `/assessors/campaigns/${campaignId}/user_reports/${id}/download.pdf`,
    responseType: 'blob',
    loader: true,
  },
})

const HANDLERS = {
  [FETCH_SINGLE_USER]: (state: State, { response }: ApiActionResponse<FetchSingle>) => (
    { ...state, list: response.userReports }),
  [FETCH_SINGLE]: (state: State, action: AnyAction) => ({
    ...state,
    current: {
      ...humps.camelizeKeys(action.response),
      results: action.response.results,
      report: action.response.report,
      user: action.response.user,
      loaded: true,
    },
  }),
}

export default createReducer(HANDLERS, defaultState)
