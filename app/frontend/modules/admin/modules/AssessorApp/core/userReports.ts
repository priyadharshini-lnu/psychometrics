import _ from 'lodash'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import humps from 'humps'
import { AnyAction } from 'redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { createReducer } from '~/utils/redux'
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
    default_language: t.type({ code: t.string }),
    locales: t.unknown,
    name: t.string,
    available_languages: t.array(t.type({ code: t.string })),
  }),
  results: t.UnknownRecord,
})

export interface UserReportDetail extends t.TypeOf<typeof UserReportDetailTR> {
  loaded: boolean
}


export type State = {
  list: UserReport[],
  current: UserReportDetail,
  externalReport: ExternalReportDetails,
}

const defaultState: State = {
  list: [],
  externalReport: {} as ExternalReportDetails,
  current: {
    loaded: false,
    user: { id: undefined, email: '' },
    report: {
      default_language: { code: 'en' }, locales: null, name: '', available_languages: [],
    },
    results: {},
  },
}

export const FETCH_SINGLE = 'assessor/userReports/FETCH_SINGLE'
export const FETCH_SINGLE_REQUEST = 'assessor/userReports/FETCH_SINGLE_REQUEST'


export const get = (state: RootState): State => _.get(state, ['assessors', 'userReports'])
export const getCurrent = (state: RootState): UserReportDetail => _.get(get(state), ['current'])

const FETCH_SINGLE_USER = 'assessors/users/FETCH_SINGLE'
export const DOWNLOAD = 'assessors/userReports/DOWNLOAD'
export const ASYNC_DOWNLOAD = 'assessors/userReports/ASYNC_DOWNLOAD'

export const fetchSingle = (campaignId: number, id: number, params = {}) => ({
  type: FETCH_SINGLE,
  request: {
    url: `/assessors/campaigns/${campaignId}/user_reports/${id}`,
    camelize: false,
    body: params,
    typedResponse: UserReportDetailTR,
  },
})

export const asyncDownload = (campaignId: number, id: number) => ({
  type: ASYNC_DOWNLOAD,
  request: {
    url: `/assessors/campaigns/${campaignId}/user_reports/${id}/download`,
  },
})

export const download = (campaignId: number, id: number, params) => ({
  type: DOWNLOAD,
  request: {
    url: `/assessors/campaigns/${campaignId}/user_reports/${id}/download.pdf`,
    responseType: 'blob',
    loader: true,
    body: params,
  },
})

const ExternalReportDetailsTR = t.type({
  id: t.number,
  userId: t.number,
  reportName: t.string,
  userEmail: t.string,
  pdfUrl: t.string,
  canDownloadReport: t.boolean,
})
type ExternalReportDetails = t.TypeOf<typeof ExternalReportDetailsTR>
export const getExternalReport = (state: RootState) => _.get(get(state), ['externalReport'])
type FetchExternalReportDetailsType = ApiActionResponse<ExternalReportDetails>
export const FETCH_EXTERNAL_REPORT_DETAILS = 'campaigns/userReports/FETCH_EXTERNAL_REPORT_DETAILS'
export const fetchExternalReportDetails = (campaignId: number, id: number) => ({
  type: FETCH_EXTERNAL_REPORT_DETAILS,
  request: {
    url: `/assessors/campaigns/${campaignId}/user_reports/${id}`,
    typedResponse: ExternalReportDetailsTR,
  },
})


const HANDLERS = {
  [FETCH_SINGLE_USER]: (state: State, { response }: ApiActionResponse<FetchSingle>) => (
    { ...state, list: response.userReports }),
  [FETCH_SINGLE_REQUEST]: (state: State) => ({ ...state, current: { loaded: false } }),
  [FETCH_SINGLE]: (state: State, action: AnyAction) => ({
    ...state,
    current: {
      ...humps.camelizeKeys(action.response),
      results: action.response.results,
      report: action.response.report,
      user: action.response.user,
      moduleOverrides: action.response.module_overrides,
      loaded: true,
    },
  }),
  [FETCH_EXTERNAL_REPORT_DETAILS]: (state: State, action: FetchExternalReportDetailsType) => ({
    ...state,
    externalReport: action.response,
  }),
}

export default createReducer(HANDLERS, defaultState)
