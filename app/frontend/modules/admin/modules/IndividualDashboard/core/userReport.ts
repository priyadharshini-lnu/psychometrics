import _ from 'lodash'
import { createReducer } from 'utils/redux'
import * as t from 'io-ts'
import { RootState } from 'modules/admin/core/rootReducers'
import { AnyAction } from 'redux'

export const UserReportTR = t.type({
  id: t.number,
  name: t.string,
})
export type UserReport = t.TypeOf<typeof UserReportTR>

export const CustomFieldsTR = t.array(
  t.type({
    name: t.string,
    value: t.union([t.string, t.null]),
  }),
)
export const UserTR = t.type({
  id: t.number,
  email: t.string,
  first_name: t.union([t.string, t.null]),
  last_name: t.union([t.string, t.null]),
  age: t.union([t.number, t.null]),
  gender: t.union([t.string, t.null]),
  locale: t.union([t.string, t.null]),
  timezone: t.union([t.string, t.null]),
  custom_fields: CustomFieldsTR,
})
export const UserReportDetailTR = t.type({
  user: UserTR,
  report: t.type({
    default_language: t.unknown,
    locales: t.unknown,
    name: t.string,
  }),
  results: t.UnknownRecord,
})
type User = t.TypeOf<typeof UserTR>

interface UserReportDetail extends t.TypeOf<typeof UserReportDetailTR> {
  loaded: boolean
}

export type State = {
  current: UserReportDetail,
}

const defaultState: State = {
  current: {
    loaded: false,
    user: {} as User,
    report: { default_language: null, locales: null, name: '' },
    results: {},
  },
}
export const get = (state: RootState): State => _.get(state, ['individualDashboard', 'userReport'])
export const getCurrent = (state: RootState): UserReportDetail => _.get(get(state), ['current'])


export const FETCH_REPORT = 'individualDashboard/userReports/FETCH_REPORT'
export const fetchReport = (campaignId: number, email: string) => ({
  type: FETCH_REPORT,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_reports/dashboard`,
    camelizeExcept: ['$.results', '$.report', '$.user'],
    typedResponse: UserReportDetailTR,
    body: { email },
  },
})

export const CLEAR_USER_REPORT_DETAILS = 'campaigns/userReports/CLEAR_USER_REPORT_DETAILS'
export const clearUseReportDetails = () => ({ type: CLEAR_USER_REPORT_DETAILS })

const HANDLERS = {
  [FETCH_REPORT]: (state: State, action: AnyAction) => ({
    ...state,
    current: { ...action.response, loaded: true },
  }),
  [CLEAR_USER_REPORT_DETAILS]: (state: State) => ({ ...state, current: defaultState.current }),
}

export const reducer = createReducer(HANDLERS, defaultState)
