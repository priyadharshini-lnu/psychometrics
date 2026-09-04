import _ from 'lodash'
import ApiAction from 'interfaces/ApiAction'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import * as t from 'io-ts'
import { RootState } from '~/modules/admin/core/rootReducers'
import { TableConfig } from '~/modules/admin/core/filterAndPagination/interfaces'
import { createReducer } from '~/utils/redux'
import { UserAssessmentTR } from './userAssessments'
import { UserReportTR } from './userReports'
import { UserRecordingTR } from './userRecordings'

const UserTR = t.type({
  id: t.number,
  fullName: t.string,
  email: t.string,
  totalEvaluations: t.number,
  completedEvaluations: t.number,
  evaluationCompletionStatus: t.string,
  totalModeration: t.number,
  completedModeration: t.number,
  moderationCompletionStatus: t.string,
})

const UserListResponseTR = t.type({
  list: t.array(UserTR),
  total: t.number,
})

const SingleUserTR = t.type({
  id: t.number,
  email: t.string,
  fullName: t.string,
  assessorCanModerateScores: t.boolean,
})
export type SingleUser = t.TypeOf<typeof SingleUserTR>

const FetchSingleTR = t.type({
  user: SingleUserTR,
  userAssessments: t.array(UserAssessmentTR),
  userReports: t.array(UserReportTR),
  userRecordings: t.array(UserRecordingTR),
})
export type FetchSingle = t.TypeOf<typeof FetchSingleTR>

export type User = t.TypeOf<typeof UserTR>
export type UserListResponse = t.TypeOf<typeof UserListResponseTR>
export type State = UserListResponse & { current?: SingleUser }

const defaultState: State = { list: [], total: 0 }

export const get = (state: RootState) => _.get(state, ['assessors', 'users'])
export const getCurrent = (state: RootState) => _.get(get(state), ['current'])

export const FETCH = 'assessors/users/FETCH'
export const FETCH_SINGLE = 'assessors/users/FETCH_SINGLE'

export const fetch = (campaignId: number, tableConfig: TableConfig): ApiAction<State> => ({
  type: FETCH,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${campaignId}/users`,
    debounce: 500,
    loader: true,
    tableConfig,
    typedResponse: UserListResponseTR,
  },
})

export const fetchSingle = (campaignId: number, userId: number): ApiAction<FetchSingle> => ({
  type: FETCH_SINGLE,
  request: {
    method: 'get',
    url: `/assessors/campaigns/${campaignId}/users/${userId}`,
    loader: true,
    typedResponse: FetchSingleTR,
  },
})

const HANDLERS = {
  [FETCH]: (_: State, { response }: ApiActionResponse<State>) => response,
  [FETCH_SINGLE]: (state: State, { response }: ApiActionResponse<FetchSingle>) => (
    { ...state, current: response.user }),
}

export default createReducer(HANDLERS, defaultState)
